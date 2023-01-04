import { ConfigProvider } from '@yohira/extensions.config/ConfigProvider';
import { MemoryConfigSource } from '@yohira/extensions.config/MemoryConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/MemoryConfigurationProvider.cs,f1f917a10087145f,references
export class MemoryConfigProvider extends ConfigProvider {
	constructor(private readonly source: MemoryConfigSource) {
		super();

		// TODO
	}
}
