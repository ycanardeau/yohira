import { IAsyncDisposable, IServiceProvider } from '@yohira/base';

import { IServiceScope } from './IServiceScope';

export class AsyncServiceScope implements IServiceScope, IAsyncDisposable {
	constructor(private readonly serviceScope: IServiceScope) {}

	get serviceProvider(): IServiceProvider {
		return this.serviceScope.serviceProvider;
	}

	dispose(): void {
		this.serviceScope.dispose();
	}

	private static isIAsyncDisposable(
		serviceScope: IServiceScope | (IServiceScope & IAsyncDisposable),
	): serviceScope is IServiceScope & IAsyncDisposable {
		return 'disposeAsync' in serviceScope;
	}

	disposeAsync(): Promise<void> {
		if (AsyncServiceScope.isIAsyncDisposable(this.serviceScope)) {
			return this.serviceScope.disposeAsync();
		}
		this.serviceScope.dispose();

		return Promise.resolve();
	}
}
