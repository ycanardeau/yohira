import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/Extensions/ServiceCollectionDescriptorExtensions.cs,74efb8e4739fdc19,references
export const tryAdd = (
	collection: IServiceCollection,
	descriptor: ServiceDescriptor,
): void => {
	const count = collection.count;
	for (let i = 0; i < count; i++) {
		if (collection.get(i).serviceType === descriptor.serviceType) {
			// Already added
			return;
		}
	}

	collection.add(descriptor);
};

export const tryAddIterable = (
	collection: IServiceCollection,
	descriptor: ServiceDescriptor,
): void => {
	// TODO
	tryAdd(collection, descriptor);
};
