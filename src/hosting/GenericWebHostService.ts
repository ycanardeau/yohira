import { HostingApp } from '@/hosting/HostingApp';
import { IHostedService } from '@/hosting/IHostedService';
import { IServer } from '@/hosting/IServer';
import { ILogger, ILoggerFactory } from '@/logging/ILogger';
import { IOptions } from '@/options/IOptions';
import { TYPES } from '@/types';
import { inject, injectable } from 'inversify';

// https://github.com/dotnet/aspnetcore/blob/600eb9aa53c052ec7327e2399744215dbe493a89/src/Hosting/Hosting/src/GenericHost/GenericWebHostServiceOptions.cs#L8
export class GenericWebHostServiceOptions {}

// https://github.com/dotnet/aspnetcore/blob/600eb9aa53c052ec7327e2399744215dbe493a89/src/Hosting/Hosting/src/GenericHost/GenericWebHostService.cs#L17
@injectable()
export class GenericWebHostService implements IHostedService {
	readonly options: GenericWebHostServiceOptions;
	readonly logger: ILogger;

	constructor(
		@inject(TYPES.IOptions)
		options: IOptions<GenericWebHostServiceOptions>,
		@inject(TYPES.IServer)
		readonly server: IServer,
		@inject(TYPES.ILoggerFactory)
		loggerFactory: ILoggerFactory,
	) {
		this.options = options.getValue(GenericWebHostServiceOptions);
		this.logger = loggerFactory.createLogger('yohira.hosting.diagnostics');
	}

	start = async (): Promise<void> => {
		// IMPL

		const httpApp = new HostingApp(this.logger /* TODO */);

		await this.server.start(httpApp);

		// IMPL
	};
}
