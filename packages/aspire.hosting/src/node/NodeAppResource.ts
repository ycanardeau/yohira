import { EndpointReference } from '../application-model/EndpointReference';
import { ExecutableResource } from '../application-model/ExecutableResource';
import { getEndpoint } from '../application-model/IResourceWithBindings';
import { IResourceWithServiceDiscovery } from '../application-model/IResourceWithServiceDiscovery';

// https://github.com/dotnet/aspire/blob/900b1a2f244fca2ed263d86a7a5c583e0926af06/src/Aspire.Hosting/Node/NodeAppResource.cs#L14
/**
 * A resource that represents a node application.
 */
export class NodeAppResource
	extends ExecutableResource
	implements IResourceWithServiceDiscovery
{
	/**
	 *
	 * @param name The name of the resource
	 * @param command The command to execute.
	 * @param workingDirectory The working directory to use for the command. If null, the working directory of the current process is used.
	 * @param args The arguments to pass to the command.
	 */
	constructor(
		name: string,
		command: string,
		workingDirectory: string,
		args: string[] | undefined,
	) {
		super(name, command, workingDirectory, args);
	}

	getEndpoint(bindingName: string): EndpointReference {
		return getEndpoint(this, bindingName);
	}
}
