import {
	IConfig,
	IConfigBuilder,
} from '@yohira/extensions.config.abstractions';

import { ChainedConfigSource } from './ChainedConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ChainedBuilderExtensions.cs,c1cdfd515e420ab1,references
export function addConfig(
	configBuilder: IConfigBuilder,
	config: IConfig,
	shouldDisposeConfig = false,
): IConfigBuilder {
	configBuilder.add(new ChainedConfigSource(config, shouldDisposeConfig));
	return configBuilder;
}
