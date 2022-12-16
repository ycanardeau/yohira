import { IDisposable } from '@yohira/base/IDisposable';
import { IHost } from '@yohira/hosting.abstractions/IHost';
import {
	logStarted,
	logStarting,
	logStopped,
	logStopping,
} from '@yohira/hosting/internal/HostingLoggerExtensions';
import { ILogger } from '@yohira/logging.abstractions/ILogger';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/Host.cs,aa490635fa6d2cca,references
export class Host implements IHost, IDisposable {
	private stopCalled = false;

	constructor(private readonly logger: ILogger<Host>) {}

	start = async (): Promise<void> => {
		logStarting(this.logger);

		// TODO
		throw new Error('Method not implemented.');

		logStarted(this.logger);
	};

	stop = async (): Promise<void> => {
		this.stopCalled = true;
		logStopping(this.logger);

		// TODO
		throw new Error('Method not implemented.');

		logStopped(this.logger);
	};

	dispose = async (): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
