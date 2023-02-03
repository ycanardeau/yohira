import { FileConfigProvider } from '@yohira/extensions.config.file-extensions';
import { Stream } from 'node:stream';

import { JsonConfigFileParser } from './JsonConfigFileParser';
import { JsonConfigSource } from './JsonConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationProvider.cs,c9ab2919b7ca9b1d,references
export class JsonConfigProvider extends FileConfigProvider {
	constructor(source: JsonConfigSource) {
		super(source);
	}

	loadStreamSync(stream: Stream): void {
		try {
			this.data = JsonConfigFileParser.parse(stream);
		} catch {
			throw new Error('Could not parse the JSON file.' /* LOC */);
		}
	}
}
