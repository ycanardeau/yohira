import { IAsyncDisposable } from '@yohira/base/IDisposable';
import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { Type } from '@yohira/base/Type';
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
export class Host implements IHost, IAsyncDisposable {
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

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	disposeAsync(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
