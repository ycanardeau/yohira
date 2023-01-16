import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { EnvVariablesConfigSource } from '@yohira/extensions.config.env-variables/EnvVariablesConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.EnvironmentVariables/EnvironmentVariablesExtensions.cs,1e6bc687ae5d7227,references
export function addEnvVariables(
	configBuilder: IConfigBuilder,
	prefix: string | undefined,
): IConfigBuilder {
	configBuilder.add(new EnvVariablesConfigSource(prefix));
	return configBuilder;
}