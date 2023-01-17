import {
	IConfigProvider,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';

import { MemoryConfigProvider } from './MemoryConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration/MemoryConfigurationSource.cs,d3a1a06ef0ce2f02,references
export class MemoryConfigSource implements IConfigSource {
	constructor(readonly initialData?: Record<string, string | undefined>) {}

	build(): IConfigProvider {
		return new MemoryConfigProvider(this);
	}
}
