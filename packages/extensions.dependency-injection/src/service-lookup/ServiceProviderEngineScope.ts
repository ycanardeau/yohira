import { IAsyncDisposable, IDisposable, IServiceProvider } from '@yohira/base';
import {
	IServiceScope,
	IServiceScopeFactory,
} from '@yohira/extensions.dependency-injection.abstractions';

import { ServiceProvider } from '../ServiceProvider';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceProviderEngineScope.cs,da6e7172da9cbbcf,references
export class ServiceProviderEngineScope
	implements
		IServiceScope,
		IServiceProvider,
		IAsyncDisposable,
		IServiceScopeFactory
{
	private disposed = false;
	private disposables: (IDisposable | IAsyncDisposable)[] | undefined;

	/** @internal */ readonly resolvedServices: Map<
		number /* TODO: ServiceCacheKey */,
		object | undefined
	>;

	constructor(
		readonly rootProvider: ServiceProvider,
		readonly isRootScope: boolean,
	) {
		this.resolvedServices = new Map();
	}

	getService<T>(serviceType: symbol): T | undefined {
		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}

		return this.rootProvider.getService(serviceType, this);
	}

	get serviceProvider(): IServiceProvider {
		return this;
	}

	createScope(): IServiceScope {
		return this.rootProvider.createScope();
	}

	private isIDisposable(
		service: object | IDisposable | IAsyncDisposable | undefined,
	): service is IDisposable {
		return service !== undefined && Symbol.dispose in service;
	}

	private isIAsyncDisposable(
		service: object | IDisposable | IAsyncDisposable | undefined,
	): service is IAsyncDisposable {
		return service !== undefined && Symbol.asyncDispose in service;
	}

	/** @internal */ captureDisposable(
		service: object | IDisposable | IAsyncDisposable | undefined,
	): object | IDisposable | IAsyncDisposable | undefined {
		if (
			this === service ||
			!(this.isIDisposable(service) || this.isIAsyncDisposable(service))
		) {
			return service;
		}

		let disposed = false;
		// REVIEW: lock
		if (this.disposed) {
			disposed = true;
		} else {
			this.disposables ??= [];

			this.disposables.push(service);
		}

		if (disposed) {
			function throwObjectDisposedError(): void {
				throw new Error('Cannot access a disposed object.' /* LOC */);
			}

			if (this.isIDisposable(service)) {
				service[Symbol.dispose]();

				throwObjectDisposedError();
			} else {
				service[Symbol.asyncDispose]().then(throwObjectDisposedError);
			}
		}

		return service;
	}

	private beginDispose(): (IDisposable | IAsyncDisposable)[] | undefined {
		// REVIEW: lock
		if (this.disposed) {
			return undefined;
		}

		// TODO: log

		this.disposed = true;

		if (this.isRootScope && !this.rootProvider.isDisposed()) {
			this.rootProvider[Symbol.dispose]();
		}

		return this.disposables;
	}

	[Symbol.dispose](): void {
		const toDispose = this.beginDispose();

		if (toDispose !== undefined) {
			for (let i = toDispose.length - 1; i >= 0; i--) {
				const disposable = toDispose[i];
				if (this.isIDisposable(disposable)) {
					disposable[Symbol.dispose]();
				} else {
					throw new Error(
						`{${disposable.constructor.name}}' type only implements IAsyncDisposable. Use asyncDispose to dispose the container.` /* LOC */,
					);
				}
			}
		}
	}

	// REVIEW
	async [Symbol.asyncDispose](): Promise<void> {
		const toDispose = this.beginDispose();

		if (toDispose !== undefined) {
			for (let i = toDispose.length - 1; i >= 0; i--) {
				const disposable = toDispose[i];
				if (this.isIAsyncDisposable(disposable)) {
					await disposable[Symbol.asyncDispose]();
				} else {
					disposable[Symbol.dispose]();
				}
			}
		}
	}
}
