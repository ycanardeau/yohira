import { EnvCallbackAnnotation } from '../application-model/EnvCallbackAnnotation';
import { IResource } from '../application-model/IResource';
import { IResourceBuilder } from '../application-model/IResourceBuilder';

// https://github.com/dotnet/aspire/blob/e3fc7cc96166078b27ba9e63558761ef265a2fcd/src/Aspire.Hosting/Extensions/ResourceBuilderExtensions.cs#L27
/**
 * Adds an environment variable to the resource.
 * @param builder The resource builder.
 * @param name The name of the environment variable.
 * @param value The value of the environment variable.
 * @returns A resource configured with the specified environment variable.
 */
export function withEnv<T extends IResource>(
	builder: IResourceBuilder<T>,
	name: string,
	value: string | undefined,
): IResourceBuilder<T> {
	return builder.withAnnotation(
		EnvCallbackAnnotation.fromNameAndCallback(name, () => value ?? ''),
	);
}
