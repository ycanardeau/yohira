import { IDisposable, IServiceProvider, Type } from '@yohira/base';
import { getServices } from '@yohira/extensions.dependency-injection.abstractions';
import { IHost, IHostedService } from '@yohira/extensions.hosting.abstractions';
import { ILoggerT } from '@yohira/extensions.logging.abstractions';

import {
	logStarted,
	logStarting,
	logStopped,
	logStopping,
} from '../internal/HostingLoggerExtensions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/Host.cs,aa490635fa6d2cca,references
export class Host implements IHost, IDisposable {
	private hostedServices?: IHostedService[];
	private stopCalled = false;

	constructor(
		readonly services: IServiceProvider,
		private readonly logger: ILoggerT<Host>,
	) {}

	async start(): Promise<void> {
		logStarting(this.logger);

		// TODO

		// TODO
		this.hostedServices = getServices<IHostedService>(
			this.services,
			Type.from('IHostedService'),
		);

		for (const hostedService of this.hostedServices) {
			await hostedService.start();

			// TODO
		}

		// TODO

		logStarted(this.logger);
	}

	async stop(): Promise<void> {
		this.stopCalled = true;
		logStopping(this.logger);

		// TODO
		//throw new Error('Method not implemented.');

		logStopped(this.logger);
	}

	dispose(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
