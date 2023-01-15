import { IAsyncDisposable } from '@yohira/base/IDisposable';
import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { Type } from '@yohira/base/Type';
import { IServiceScope } from '@yohira/extensions.dependency-injection.abstractions/IServiceScope';
import { ServiceProvider } from '@yohira/extensions.dependency-injection/ServiceProvider';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceProviderEngineScope.cs,da6e7172da9cbbcf,references
export class ServiceProviderEngineScope
	implements IServiceScope, IServiceProvider, IAsyncDisposable
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

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	disposeAsync(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
