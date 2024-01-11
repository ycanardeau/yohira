import { IDistributedAppBuilder } from '../IDistributedAppBuilder';
import { IResource } from './IResource';
import { IResourceAnnotation } from './IResourceAnnotation';

// https://github.com/dotnet/aspire/blob/4769f758b5337f01462664f7f930ba87a453887f/src/Aspire.Hosting/ApplicationModel/IResourceBuilder.cs#L10
/**
 * Defines a builder for creating resources of type <typeparamref name="T"/>.
 */
export interface IResourceBuilder<T extends IResource> {
	/**
	 * Gets the distributed application builder associated with this resource builder.
	 */
	readonly appBuilder: IDistributedAppBuilder;
	/**
	 * Gets the resource of type <typeparamref name="T"/> that is being built.
	 */
	readonly resource: T;
	/**
	 * Adds an annotation to the resource being built.
	 * @param annotation The type of the annotation to add.
	 * @returns The resource builder instance.
	 */
	withAnnotation<TAnnotation extends IResourceAnnotation>(
		annotation: TAnnotation,
	): IResourceBuilder<T>;
}
