import { IConfig } from '@yohira/extensions.config.abstractions/IConfig';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { IConfigSource } from '@yohira/extensions.config.abstractions/IConfigSource';
import { ChainedConfigProvider } from '@yohira/extensions.config/ChainedConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ChainedConfigurationSource.cs,9d7ac1df8e979b91,references
export class ChainedConfigSource implements IConfigSource {
	constructor(
		public config: IConfig | undefined,
		public shouldDisposeConfig: boolean,
	) {}

	build(builder: IConfigBuilder): IConfigProvider {
		return new ChainedConfigProvider(this);
	}
}
