import { IServiceCollection } from '../IServiceCollection';
import { ServiceDescriptor } from '../ServiceDescriptor';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/Extensions/ServiceCollectionDescriptorExtensions.cs,74efb8e4739fdc19,references
export function tryAddServiceDescriptor(
	collection: IServiceCollection,
	descriptor: ServiceDescriptor,
): void {
	const count = collection.count;
	for (let i = 0; i < count; i++) {
		if (collection.get(i).serviceType === descriptor.serviceType) {
			// Already added
			return;
		}
	}

	collection.add(descriptor);
}

export function tryAddServiceDescriptorIterable(
	collection: IServiceCollection,
	descriptor: ServiceDescriptor,
): void;
export function tryAddServiceDescriptorIterable(
	collection: IServiceCollection,
	descriptors: ServiceDescriptor[],
): void;
export function tryAddServiceDescriptorIterable(
	collection: IServiceCollection,
	descriptorOrDescriptors: ServiceDescriptor | ServiceDescriptor[],
): void {
	if (descriptorOrDescriptors instanceof Array) {
		for (const descriptor of descriptorOrDescriptors) {
			tryAddServiceDescriptor(collection, descriptor);
		}
	} else {
		// TODO
		tryAddServiceDescriptor(collection, descriptorOrDescriptors);
	}
}
