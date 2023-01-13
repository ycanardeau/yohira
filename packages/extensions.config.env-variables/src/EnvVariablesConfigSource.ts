import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { IConfigSource } from '@yohira/extensions.config.abstractions/IConfigSource';
import { EnvVariablesConfigProvider } from '@yohira/extensions.config.env-variables/EnvVariablesConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.EnvironmentVariables/EnvironmentVariablesConfigurationSource.cs,38d3e32134fb0f4d,references
export class EnvVariablesConfigSource implements IConfigSource {
	constructor(public prefix?: string) {}

	build(builder: IConfigBuilder): IConfigProvider {
		return new EnvVariablesConfigProvider(this.prefix);
	}
}
