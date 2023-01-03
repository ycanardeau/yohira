import { IDisposable } from '@yohira/base/IDisposable';
import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { getServices } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { IHost } from '@yohira/extensions.hosting.abstractions/IHost';
import { IHostedService } from '@yohira/extensions.hosting.abstractions/IHostedService';
import {
	logStarted,
	logStarting,
	logStopped,
	logStopping,
} from '@yohira/extensions.hosting/internal/HostingLoggerExtensions';
import { ILoggerT } from '@yohira/extensions.logging.abstractions/ILoggerT';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/Host.cs,aa490635fa6d2cca,references
export class Host implements IHost, IDisposable {
	private hostedServices?: IHostedService[];
	private stopCalled = false;

	constructor(
		readonly services: IServiceProvider,
		private readonly logger: ILoggerT<Host>,
	) {}

	start = async (): Promise<void> => {
		logStarting(this.logger);

		// TODO

		// TODO
		this.hostedServices = getServices<IHostedService>(
			this.services,
			'IHostedService',
		);

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
