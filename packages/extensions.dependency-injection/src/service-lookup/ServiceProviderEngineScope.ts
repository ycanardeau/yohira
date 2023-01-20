import { IAsyncDisposable, IServiceProvider, Type } from '@yohira/base';
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

	constructor(
		readonly rootProvider: ServiceProvider,
		readonly isRootScope: boolean,
	) {}

	getService<T>(serviceType: Type): T | undefined {
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

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	disposeAsync(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
