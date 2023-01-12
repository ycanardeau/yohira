import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { MemoryConfigSource } from '@yohira/extensions.config/MemoryConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/MemoryConfigurationBuilderExtensions.cs,c485e5b955d5deed,references
export function addInMemoryCollection(
	configBuilder: IConfigBuilder,
	initialData: Record<string, string | undefined> | undefined,
): IConfigBuilder {
	configBuilder.add(new MemoryConfigSource(initialData));
	return configBuilder;
}
