import { ConfigProvider } from '@/ConfigProvider';
import { MemoryConfigSource } from '@/MemoryConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/MemoryConfigurationProvider.cs,f1f917a10087145f,references
export class MemoryConfigProvider extends ConfigProvider {
	constructor(private readonly source: MemoryConfigSource) {
		super();

		if (source.initialData !== undefined) {
			for (const [key, value] of Object.entries(source.initialData)) {
				this.data.set(key, value);
			}
		}
	}
}
