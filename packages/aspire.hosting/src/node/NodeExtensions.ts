import { combinePaths, getDirectoryName } from '@yohira/base';
import { isDevelopment } from '@yohira/extensions.hosting.abstractions';

import { IDistributedAppBuilder } from '../IDistributedAppBuilder';
import { IResourceBuilder } from '../application-model/IResourceBuilder';
import { withEnv } from '../extensions/ResourceBuilderExtensions';
import { withOtlpExporter } from '../otlp/OtlpConfigExtensions';
import { normalizePathForCurrentPlatform } from '../utils/PathNormalizer';
import { NodeAppResource } from './NodeAppResource';

// https://github.com/dotnet/aspire/blob/900b1a2f244fca2ed263d86a7a5c583e0926af06/src/Aspire.Hosting/Node/NodeExtensions.cs#L58
function withNodeDefaults(
	builder: IResourceBuilder<NodeAppResource>,
): IResourceBuilder<NodeAppResource> {
	return withEnv(
		withOtlpExporter(builder),
		'NODE_ENV',
		isDevelopment(builder.appBuilder.env) ? 'development' : 'production',
	);
}

// https://github.com/dotnet/aspire/blob/900b1a2f244fca2ed263d86a7a5c583e0926af06/src/Aspire.Hosting/Node/NodeExtensions.cs#L23
/**
 * Adds a node application to the application model. Node should available on the PATH.
 * @param builder The {@link IDistributedAppBuilder} to add the resource to.
 * @param name The name of the resource.
 * @param scriptPath The path to the script that Node will execute.
 * @param workingDirectory The working directory to use for the command. If null, the working directory of the current process is used.
 * @param args The arguments to pass to the command.
 * @returns
 */
export function addNodeApp(
	builder: IDistributedAppBuilder,
	name: string,
	scriptPath: string,
	workingDirectory: string = getDirectoryName(scriptPath),
	args: string[] = [],
): IResourceBuilder<NodeAppResource> {
	const effectiveArgs = [scriptPath, ...args];
	workingDirectory = normalizePathForCurrentPlatform(
		combinePaths(builder.appHostDirectory, workingDirectory),
	);

	const resource = new NodeAppResource(
		name,
		'node',
		workingDirectory,
		effectiveArgs,
	);

	return withNodeDefaults(builder.addResource(resource));
}
