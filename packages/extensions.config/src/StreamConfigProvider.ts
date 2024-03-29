import { Stream } from 'node:stream';

import { ConfigProvider } from './ConfigProvider';
import { StreamConfigSource } from './StreamConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/StreamConfigurationProvider.cs,61fbe4f00f0fe7eb,references
export abstract class StreamConfigProvider extends ConfigProvider {
	private loaded = false;

	constructor(readonly source: StreamConfigSource) {
		super();
	}

	abstract loadStreamSync(stream: Stream): void;

	loadSync(): void {
		if (this.loaded) {
			throw new Error(
				'StreamConfigProviders cannot be loaded more than once.' /* LOC */,
			);
		}

		if (this.source.stream === undefined) {
			throw new Error('source.stream cannot be undefined.' /* LOC */);
		}

		this.loadStreamSync(this.source.stream);
		this.loaded = true;
	}
}
