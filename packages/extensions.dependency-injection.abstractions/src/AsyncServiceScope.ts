import { IAsyncDisposable, IServiceProvider } from '@yohira/base';

import { IServiceScope } from './IServiceScope';

export class AsyncServiceScope implements IServiceScope, IAsyncDisposable {
	constructor(private readonly serviceScope: IServiceScope) {}

	get serviceProvider(): IServiceProvider {
		return this.serviceScope.serviceProvider;
	}

	[Symbol.dispose](): void {
		this.serviceScope[Symbol.dispose]();
	}

	private static isIAsyncDisposable(
		serviceScope: IServiceScope | (IServiceScope & IAsyncDisposable),
	): serviceScope is IServiceScope & IAsyncDisposable {
		return Symbol.asyncDispose in serviceScope;
	}

	[Symbol.asyncDispose](): Promise<void> {
		if (AsyncServiceScope.isIAsyncDisposable(this.serviceScope)) {
			return this.serviceScope[Symbol.asyncDispose]();
		}
		this.serviceScope[Symbol.dispose]();

		return Promise.resolve();
	}
}
