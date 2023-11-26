import { IConfig } from '@yohira/extensions.config.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IHostedService } from '@yohira/extensions.hosting.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';
import { IStartupFilter, WebHostDefaults } from '@yohira/hosting.abstractions';
import {
	IServer,
	IServerAddressesFeature,
} from '@yohira/hosting.server.abstractions';
import {
	IHttpContextFactory,
	RequestDelegate,
} from '@yohira/http.abstractions';

import { IAppBuilderFactory } from '../builder/IAppBuilderFactory';
import { GenericWebHostServiceOptions } from '../generic-host/GenericWebHostServiceOptions';
import { HostingApp } from '../internal/HostingApp';
import { parseBoolean } from '../internal/WebHostUtilities';

// TODO: move
const uriSchemeHttp = 'http';
const uriSchemeHttps = 'https';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingLoggerExtensions.cs,7429950804a9c143,references
function logPortsOverriddenByUrls(
	logger: ILogger,
	httpPorts: string,
	httpsPorts: string,
	urls: string,
): void {
	if (logger.isEnabled(LogLevel.Warning)) {
		logger.log(
			LogLevel.Warning,
			`Overriding HTTP_PORTS '${httpPorts}' and HTTPS_PORTS '${httpsPorts}'. Binding to values defined by URLS instead '${urls}'.`,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostService.cs,fd20321226ab7078,references
export class GenericWebHostService implements IHostedService {
	private readonly options: GenericWebHostServiceOptions;
	private readonly logger: ILogger;

	constructor(
		@inject(Symbol.for('IOptions<GenericWebHostServiceOptions>'))
		options: IOptions<GenericWebHostServiceOptions>,
		@inject(IServer)
		readonly server: IServer,
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
		@inject(IHttpContextFactory)
		readonly httpContextFactory: IHttpContextFactory,
		@inject(IAppBuilderFactory)
		readonly appBuilderFactory: IAppBuilderFactory,
		@inject(Symbol.for('Iterable<IStartupFilter>'))
		readonly startupFilters: Iterable<IStartupFilter>,
		@inject(IConfig) private readonly config: IConfig,
	) {
		this.options = options.getValue(GenericWebHostServiceOptions);
		this.logger = loggerFactory.createLogger('yohira.hosting.diagnostics');
	}

	async start(): Promise<void> {
		// TODO: log

		const serverAddressesFeature =
			this.server.features.get<IServerAddressesFeature>(
				IServerAddressesFeature,
			);
		const addresses = serverAddressesFeature?.addresses;
		if (
			addresses !== undefined &&
			!addresses.isReadonly &&
			addresses.count === 0
		) {
			// We support reading "urls" from app configuration
			let urls = this.config.get(WebHostDefaults.ServerUrlsKey);

			// But fall back to host settings
			if (!urls) {
				urls = this.options.webHostOptions.serverUrls;
			}

			const httpPorts =
				this.config.get(WebHostDefaults.HttpPortsKey) ?? '';
			const httpsPorts =
				this.config.get(WebHostDefaults.HttpsPortsKey) ?? '';
			if (!urls) {
				// HTTP_PORTS and HTTPS_PORTS, these are lower priority than Urls.
				function expandPorts(ports: string, scheme: string): string {
					return ports
						.split(';')
						.map((port) => port.trim())
						.filter((port) => !!port)
						.map((port) => `${scheme}://*:${port}`)
						.join(';');
				}

				const httpUrls = expandPorts(httpPorts, uriSchemeHttp);
				const httpsUrls = expandPorts(httpsPorts, uriSchemeHttps);
				urls = `${httpUrls};${httpsUrls}`;
			} else if (!!httpPorts || !!httpsPorts) {
				logPortsOverriddenByUrls(
					this.logger,
					httpPorts,
					httpsPorts,
					urls,
				);
			}

			if (!!urls) {
				// We support reading "preferHostingUrls" from app configuration
				const preferHostingUrlsConfig = this.config.get(
					WebHostDefaults.PreferHostingUrlsKey,
				);

				// But fall back to host settings
				if (!!preferHostingUrlsConfig) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					serverAddressesFeature!.preferHostingUrls = parseBoolean(
						preferHostingUrlsConfig,
					);
				} else {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					serverAddressesFeature!.preferHostingUrls =
						this.options.webHostOptions.preferHostingUrls;
				}

				for (const value of urls.split(';').filter((url) => !!url)) {
					addresses.add(value);
				}
			}
		}

		// TODO

		let app: RequestDelegate | undefined = undefined;

		try {
			let configure = this.options.configureApp;

			if (configure === undefined) {
				throw new Error(
					'No application configured.' /* TODO: Please specify an application via IWebHostBuilder.useStartup, IWebHostBuilder.configure, or specifying the startup assembly via WebHostDefaults.startupAssemblyKey in the web host configuration. */,
				);
			}

			const builder = this.appBuilderFactory.createBuilder();

			for (const filter of Array.from(this.startupFilters).reverse()) {
				configure = filter.configure(configure);
			}

			configure(builder);

			app = builder.build();
		} catch (error) {
			// TODO: log

			// TODO
			throw error;
		}

		const httpApp = new HostingApp(app, this.httpContextFactory);

		await this.server.start(httpApp);
		// TODO: log

		// TODO
	}

	async stop(): Promise<void> {
		try {
			await this.server.stop();
		} finally {
			// TODO: log
		}
	}
}
