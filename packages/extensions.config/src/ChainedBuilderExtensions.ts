import { IConfig } from '@yohira/extensions.config.abstractions/IConfig';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { ChainedConfigSource } from '@yohira/extensions.config/ChainedConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ChainedBuilderExtensions.cs,c1cdfd515e420ab1,references
export const addConfig = (
	configBuilder: IConfigBuilder,
	config: IConfig,
	shouldDisposeConfig = false,
): IConfigBuilder => {
	configBuilder.add(new ChainedConfigSource(config, shouldDisposeConfig));
	return configBuilder;
};
