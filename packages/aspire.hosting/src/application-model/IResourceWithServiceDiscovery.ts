import { IResourceWithBindings } from './IResourceWithBindings';

// https://github.com/dotnet/aspire/blob/360c6a9e25d43b71921584288c609032cedd9fcf/src/Aspire.Hosting/ApplicationModel/IResourceWithServiceDiscovery.cs#L11
/**
 * A resource that supports exporting service discovery information.
 */
export type IResourceWithServiceDiscovery = IResourceWithBindings;
