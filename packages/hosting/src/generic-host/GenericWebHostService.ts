import { IHostedService } from '@yohira/extensions.hosting.abstractions/IHostedService';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { IStartupFilter } from '@yohira/hosting.abstractions/IStartupFilter';
import { IServer } from '@yohira/hosting.server.abstractions/IServer';
import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { GenericWebHostServiceOptions } from '@yohira/hosting/generic-host/GenericWebHostServiceOptions';
import { HostingApp } from '@yohira/hosting/internal/HostingApp';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';
import { inject, injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostService.cs,fd20321226ab7078,references
@injectable()
export class GenericWebHostService implements IHostedService {
	private readonly options: GenericWebHostServiceOptions;

	constructor(
		@inject('IOptions<GenericWebHostServiceOptions>')
		options: IOptions<GenericWebHostServiceOptions>,
		@inject('IServer')
		readonly server: IServer,
		@inject('IHttpContextFactory')
		readonly httpContextFactory: IHttpContextFactory,
		@inject('IAppBuilderFactory')
		readonly appBuilderFactory: IAppBuilderFactory,
		@inject('Iterable<IStartupFilter>')
		readonly startupFilters: readonly IStartupFilter[],
	) {
		this.options = options.getValue(GenericWebHostServiceOptions);
	}

	start = async (): Promise<void> => {
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
	};

	stop = (): Promise<void> => {
		throw new Error('Method not implemented.');
	};
}
