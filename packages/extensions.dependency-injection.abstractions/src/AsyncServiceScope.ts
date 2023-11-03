import { IServiceProvider } from '@yohira/base';

import { IServiceScope } from './IServiceScope';

export class AsyncServiceScope implements IServiceScope, AsyncDisposable {
	constructor(private readonly serviceScope: IServiceScope) {}

	get serviceProvider(): IServiceProvider {
		return this.serviceScope.serviceProvider;
	}

	[Symbol.dispose](): void {
		this.serviceScope[Symbol.dispose]();
	}

	private static isIAsyncDisposable(
		serviceScope: IServiceScope | (IServiceScope & AsyncDisposable),
	): serviceScope is IServiceScope & AsyncDisposable {
		return Symbol.asyncDispose in serviceScope;
	}

	[Symbol.asyncDispose](): PromiseLike<void> {
		if (AsyncServiceScope.isIAsyncDisposable(this.serviceScope)) {
			return this.serviceScope[Symbol.asyncDispose]();
		}
		this.serviceScope[Symbol.dispose]();

		return Promise.resolve();
	}
}
