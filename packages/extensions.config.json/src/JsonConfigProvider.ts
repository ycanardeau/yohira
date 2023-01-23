import { FileConfigProvider } from '@yohira/extensions.config.file-extensions';
import { Stream } from 'node:stream';

import { JsonConfigFileParser } from './JsonConfigFileParser';
import { JsonConfigSource } from './JsonConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationProvider.cs,c9ab2919b7ca9b1d,references
export class JsonConfigProvider extends FileConfigProvider {
	constructor(source: JsonConfigSource) {
		super(source);
	}

	loadStream(stream: Stream): Promise<void> {
		try {
			this.data = JsonConfigFileParser.parse(stream);
			return Promise.resolve();
		} catch {
			throw new Error('Could not parse the JSON file.' /* LOC */);
		}
	}
}
