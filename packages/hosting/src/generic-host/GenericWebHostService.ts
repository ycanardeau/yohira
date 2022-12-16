import { IHostedService } from '@yohira/hosting.abstractions/IHostedService';
import { IServer } from '@yohira/hosting.server.abstractions/IServer';
import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { HostingApp } from '@yohira/hosting/internal/HostingApp';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';
import { inject, injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostService.cs,fd20321226ab7078,references
@injectable()
export class GenericWebHostService implements IHostedService {
	constructor(
		@inject(IServer)
		readonly server: IServer,
		@inject(IHttpContextFactory)
		readonly httpContextFactory: IHttpContextFactory,
		@inject(IAppBuilderFactory)
		readonly appBuilderFactory: IAppBuilderFactory,
	) {}

	start = async (): Promise<void> => {
		// TODO: Log.

		// TODO

		let app: RequestDelegate | undefined = undefined;

		try {
			// TODO

			const builder = this.appBuilderFactory.createBuilder();

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
