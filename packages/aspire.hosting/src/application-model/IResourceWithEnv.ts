import { IResource } from './IResource';

// https://github.com/dotnet/aspire/blob/93cbd9ae46bf1a3fbc9558567431c12e2e833468/src/Aspire.Hosting/ApplicationModel/IResourceWithEnvironment.cs#L9
/**
 * Represents a resource that is associated with an environment.
 */
export interface IResourceWithEnv extends IResource {}
