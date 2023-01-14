import { FileConfigProvider } from '@yohira/extensions.config.file-extensions/FileConfigProvider';
import { JsonConfigFileParser } from '@yohira/extensions.config.json/JsonConfigFileParser';
import { JsonConfigSource } from '@yohira/extensions.config.json/JsonConfigSource';
import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationProvider.cs,c9ab2919b7ca9b1d,references
export class JsonConfigProvider extends FileConfigProvider {
	constructor(source: JsonConfigSource) {
		super(source);
	}

	loadStream(stream: Stream): void {
		// TODO: Try.
		this.data = JsonConfigFileParser.parse(stream);
		// TODO: Catch.
	}
}
