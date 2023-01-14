import { JsonConfigFileParser } from '@yohira/extensions.config.json/JsonConfigFileParser';
import { JsonStreamConfigSource } from '@yohira/extensions.config.json/JsonStreamConfigSource';
import { StreamConfigProvider } from '@yohira/extensions.config/StreamConfigProvider';
import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonStreamConfigurationProvider.cs,26c63db45c675f72,references
export class JsonStreamConfigProvider extends StreamConfigProvider {
	constructor(source: JsonStreamConfigSource) {
		super(source);
	}

	loadStream(stream: Stream): void {
		this.data = JsonConfigFileParser.parse(stream);
	}
}
