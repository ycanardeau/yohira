import { StreamConfigProvider } from '@yohira/extensions.config';
import { Stream } from 'node:stream';

import { JsonConfigFileParser } from './JsonConfigFileParser';
import { JsonStreamConfigSource } from './JsonStreamConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonStreamConfigurationProvider.cs,26c63db45c675f72,references
export class JsonStreamConfigProvider extends StreamConfigProvider {
	constructor(source: JsonStreamConfigSource) {
		super(source);
	}

	loadStreamSync(stream: Stream): void {
		this.data = JsonConfigFileParser.parse(stream);
	}
}
