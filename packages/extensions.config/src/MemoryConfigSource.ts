import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { IConfigSource } from '@yohira/extensions.config.abstractions/IConfigSource';
import { MemoryConfigProvider } from '@yohira/extensions.config/MemoryConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration/MemoryConfigurationSource.cs,d3a1a06ef0ce2f02,references
export class MemoryConfigSource implements IConfigSource {
	constructor(readonly initialData?: Record<string, string | undefined>) {}

	build(): IConfigProvider {
		return new MemoryConfigProvider(this);
	}
}
