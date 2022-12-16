import { IHostedService } from '@yohira/hosting.abstractions/IHostedService';
import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { HostingApp } from '@yohira/hosting/internal/HostingApp';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';
import { inject, injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostService.cs,fd20321226ab7078,references
@injectable()
export class GenericWebHostService implements IHostedService {
	constructor(
		@inject(IAppBuilderFactory)
		readonly appBuilderFactory: IAppBuilderFactory,
	) {}

	start = async (): Promise<void> => {
		// TODO

		let app: RequestDelegate | undefined = undefined;

		try {
			// TODO

			const builder = this.appBuilderFactory.createBuilder();

			app = builder.build();
		} catch (error) {
			// TODO
			throw error;
		}

		const httpApp = new HostingApp(app);

		// TODO
	};

	stop = (): Promise<void> => {
		throw new Error('Method not implemented.');
	};
}
