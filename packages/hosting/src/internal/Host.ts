import { IDisposable } from '@yohira/base/IDisposable';
import { IHost } from '@yohira/hosting.abstractions/IHost';
import { IHostedService } from '@yohira/hosting.abstractions/IHostedService';
import {
	logStarted,
	logStarting,
	logStopped,
	logStopping,
} from '@yohira/hosting/internal/HostingLoggerExtensions';
import { container } from '@yohira/http.abstractions/inversify.config';
import { ILogger } from '@yohira/logging.abstractions/ILogger';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/Host.cs,aa490635fa6d2cca,references
export class Host implements IHost, IDisposable {
	private hostedServices?: IHostedService[];
	private stopCalled = false;

	constructor(private readonly logger: ILogger<Host>) {}

	start = async (): Promise<void> => {
		logStarting(this.logger);

		// TODO

		// TODO
		this.hostedServices = container.getAll(IHostedService);

		for (const hostedService of this.hostedServices) {
			await hostedService.start();

			// TODO
		}

		// TODO

		logStarted(this.logger);
	};

	stop = async (): Promise<void> => {
		this.stopCalled = true;
		logStopping(this.logger);

		// TODO
		//throw new Error('Method not implemented.');

		logStopped(this.logger);
	};

	dispose = async (): Promise<void> => {
		// TODO
		//throw new Error('Method not implemented.');
	};
}
