import { IResource } from './IResource';

// https://github.com/dotnet/aspire/blob/900b1a2f244fca2ed263d86a7a5c583e0926af06/src/Aspire.Hosting/ApplicationModel/Resource.cs#L13
/**
 * Represents an abstract resource that can be used by an application, that implements {@link IResource}.
 */
export abstract class Resource implements IResource {
	/**
	 *
	 * @param name Gets the name of the resource.
	 */
	constructor(readonly name: string) {}
}
