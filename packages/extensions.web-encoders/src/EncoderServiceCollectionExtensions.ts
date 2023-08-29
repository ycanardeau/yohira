import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';
import { addOptions } from '@yohira/extensions.options';

// https://source.dot.net/#Microsoft.Extensions.WebEncoders/EncoderServiceCollectionExtensions.cs,6c9798e88fbc3d6d,references
export function addWebEncoders(
	services: IServiceCollection,
): IServiceCollection {
	addOptions(services);

	// TODO
	//throw new Error('Method not implemented.');

	return services;
}
