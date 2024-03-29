import { IConfigBuilder } from '@yohira/extensions.config.abstractions';

import { MemoryConfigSource } from './MemoryConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/MemoryConfigurationBuilderExtensions.cs,c485e5b955d5deed,references
export function addInMemoryCollection(
	configBuilder: IConfigBuilder,
	initialData?: Record<string, string | undefined>,
): IConfigBuilder {
	configBuilder.add(new MemoryConfigSource(initialData));
	return configBuilder;
}
