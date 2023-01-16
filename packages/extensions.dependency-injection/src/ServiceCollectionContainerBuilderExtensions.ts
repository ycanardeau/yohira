import { ServiceProvider } from '@/ServiceProvider';
import { ServiceProviderOptions } from '@/ServiceProviderOptions';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceCollectionContainerBuilderExtensions.cs,346262d4cea1139c,references
export function buildServiceProvider(
	services: IServiceCollection,
	options = ServiceProviderOptions.default,
): ServiceProvider {
	return new ServiceProvider(services, options);
}
