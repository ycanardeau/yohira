import { ServiceDescriptor } from '@/dependency-injection/ServiceDescriptor';

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/IServiceCollection.cs#L11
export type IServiceCollection = Array<ServiceDescriptor>;

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceCollection.cs#L13
export class ServiceCollection
	extends Array<ServiceDescriptor>
	implements IServiceCollection
{
	// IMPL
	private isReadOnly = false;

	// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceCollection.cs#L107
	makeReadOnly = (): void => {
		this.isReadOnly = true;
	};
}
