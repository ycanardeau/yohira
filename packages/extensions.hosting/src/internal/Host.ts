import { IServiceProvider } from '@yohira/base';
import { getServices } from '@yohira/extensions.dependency-injection.abstractions';
import { IHost, IHostedService } from '@yohira/extensions.hosting.abstractions';
import { ILoggerT } from '@yohira/extensions.logging.abstractions';

import {
	logStarted,
	logStarting,
	logStopped,
	logStopping,
} from './HostingLoggerExtensions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/Host.cs,aa490635fa6d2cca,references
export class Host implements IHost, AsyncDisposable {
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

	async [Symbol.asyncDispose](): Promise<void> {
		function isAsyncDisposable(
			o: object | Disposable | AsyncDisposable,
		): o is AsyncDisposable {
			return Symbol.asyncDispose in o;
		}

		function isDisposable(
			o: object | Disposable | AsyncDisposable,
		): o is Disposable {
			return Symbol.dispose in o;
		}

		async function asyncDispose(
			o: object | Disposable | AsyncDisposable,
		): Promise<void> {
			if (isAsyncDisposable(o)) {
				await o[Symbol.asyncDispose]();
			} else if (isDisposable(o)) {
				o[Symbol.dispose]();
			}
		}

		// TODO

		// Dispose the service provider
		await asyncDispose(this.services);
	}
}
