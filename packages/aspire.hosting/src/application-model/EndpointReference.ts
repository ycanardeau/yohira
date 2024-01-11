import { IResourceWithBindings } from './IResourceWithBindings';

// https://github.com/dotnet/aspire/blob/360c6a9e25d43b71921584288c609032cedd9fcf/src/Aspire.Hosting/ApplicationModel/EndpointReference.cs#L11
/**
 * Represents an endpoint reference for a resource with bindings.
 */
export class EndpointReference {
	/**
	 *
	 * @param owner The resource with bindings that owns the endpoint reference.
	 * @param bindingName The name of the binding.
	 */
	constructor(
		/**
		 * Gets the owner of the endpoint reference.
		 */
		readonly owner: IResourceWithBindings,
		/**
		 * Gets the name of the binding associated with the endpoint reference.
		 */
		readonly bindingName: string,
	) {}
}
