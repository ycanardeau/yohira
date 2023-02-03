import { IConfigBuilder } from '@yohira/extensions.config.abstractions';

import { EnvVariablesConfigSource } from './EnvVariablesConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.EnvironmentVariables/EnvironmentVariablesExtensions.cs,1e6bc687ae5d7227,references
export function addEnvVariables(
	configBuilder: IConfigBuilder,
	prefix?: string,
): IConfigBuilder {
	configBuilder.add(new EnvVariablesConfigSource(prefix));
	return configBuilder;
}
