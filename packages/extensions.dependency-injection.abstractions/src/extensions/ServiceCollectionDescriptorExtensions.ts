import { IServiceCollection } from '../IServiceCollection';
import { ServiceDescriptor } from '../ServiceDescriptor';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/Extensions/ServiceCollectionDescriptorExtensions.cs,74efb8e4739fdc19,references
export function tryAddServiceDescriptor(
	collection: IServiceCollection,
	descriptor: ServiceDescriptor,
): void {
	const count = collection.count;
	for (let i = 0; i < count; i++) {
		if (collection.get(i).serviceType.equals(descriptor.serviceType)) {
			// Already added
			return;
		}
	}

	collection.add(descriptor);
}

export function tryAddServiceDescriptorIterable(
	collection: IServiceCollection,
	descriptor: ServiceDescriptor,
): void {
	// TODO
	tryAddServiceDescriptor(collection, descriptor);
}
