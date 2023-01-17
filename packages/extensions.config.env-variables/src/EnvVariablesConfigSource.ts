import {
	IConfigBuilder,
	IConfigProvider,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';

import { EnvVariablesConfigProvider } from './EnvVariablesConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.EnvironmentVariables/EnvironmentVariablesConfigurationSource.cs,38d3e32134fb0f4d,references
export class EnvVariablesConfigSource implements IConfigSource {
	constructor(public prefix?: string) {}

	build(builder: IConfigBuilder): IConfigProvider {
		return new EnvVariablesConfigProvider(this.prefix);
	}
}
