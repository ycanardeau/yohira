import { EndpointReference } from './EndpointReference';
import { IResource } from './IResource';

// https://github.com/dotnet/aspire/blob/360c6a9e25d43b71921584288c609032cedd9fcf/src/Aspire.Hosting/ApplicationModel/IResourceWithBindings.cs#L9
/**
 * Represents a resource that has bindings associated with it.
 */
export interface IResourceWithBindings extends IResource {
	/**
	 * Gets an endpoint reference for the specified binding.
	 * @param bindingName The name of the binding.
	 * @returns An {@link EndpointReference} object representing the endpoint reference
	 * for the specified binding.
	 */
	getEndpoint(bindingName: string): EndpointReference;
}

export function getEndpoint(
	owner: IResourceWithBindings,
	bindingName: string,
): EndpointReference {
	return new EndpointReference(owner, bindingName);
}
