import {
	IConfig,
	IConfigBuilder,
	IConfigProvider,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';

import { ChainedConfigProvider } from './ChainedConfigProvider';

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
