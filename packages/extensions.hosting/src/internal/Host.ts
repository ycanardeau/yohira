import { IAsyncDisposable, IDisposable, IServiceProvider } from '@yohira/base';
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
export class Host implements IHost, IAsyncDisposable {
	private hostedServices: IHostedService[] | undefined;
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
			IHostedService,
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

	async disposeAsync(): Promise<void> {
		function isIAsyncDisposable(
			o: object | IDisposable | IAsyncDisposable,
		): o is IAsyncDisposable {
			return 'disposeAsync' in o;
		}

		function isIDisposable(
			o: object | IDisposable | IAsyncDisposable,
		): o is IDisposable {
			return 'dispose' in o;
		}

		async function disposeAsync(
			o: object | IDisposable | IAsyncDisposable,
		): Promise<void> {
			if (isIAsyncDisposable(o)) {
				await o.disposeAsync();
			} else if (isIDisposable(o)) {
				o.dispose();
			}
		}

		// TODO

		// Dispose the service provider
		await disposeAsync(this.services);
	}
}
