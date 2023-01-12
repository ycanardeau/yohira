import { Type } from '@yohira/base/Type';
import { inject } from '@yohira/extensions.dependency-injection.abstractions/inject';
import { IHostedService } from '@yohira/extensions.hosting.abstractions/IHostedService';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { IStartupFilter } from '@yohira/hosting.abstractions/IStartupFilter';
import { IServer } from '@yohira/hosting.server.abstractions/IServer';
import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { GenericWebHostServiceOptions } from '@yohira/hosting/generic-host/GenericWebHostServiceOptions';
import { HostingApp } from '@yohira/hosting/internal/HostingApp';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostService.cs,fd20321226ab7078,references
export class GenericWebHostService implements IHostedService {
	private readonly options: GenericWebHostServiceOptions;

	constructor(
		@inject(Type.from('IOptions<GenericWebHostServiceOptions>'))
		options: IOptions<GenericWebHostServiceOptions>,
		@inject(Type.from('IServer'))
		readonly server: IServer,
		@inject(Type.from('IHttpContextFactory'))
		readonly httpContextFactory: IHttpContextFactory,
		@inject(Type.from('IAppBuilderFactory'))
		readonly appBuilderFactory: IAppBuilderFactory,
		@inject(Type.from('Iterable<IStartupFilter>'))
		readonly startupFilters: readonly IStartupFilter[],
	) {
		this.options = options.getValue(GenericWebHostServiceOptions);
	}

	async start(): Promise<void> {
		// TODO: Log.

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
			// TODO: Log.

			// TODO
			throw error;
		}

		const httpApp = new HostingApp(app, this.httpContextFactory);

		await this.server.start(httpApp);
		// TODO: Log.

		// TODO
	}

	stop(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
