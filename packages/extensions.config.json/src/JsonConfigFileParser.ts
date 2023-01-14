import { CaseInsensitiveMap } from '@yohira/extensions.config/ConfigProvider';
import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationFileParser.cs,dac10f795f76ae63,references
export class JsonConfigFileParser {
	private readonly data = new CaseInsensitiveMap<string | undefined>();
	private readonly paths: string[] = [];

	private parseStream(input: Stream): CaseInsensitiveMap<string | undefined> {
		// TODO
		throw new Error('Method not implemented.');
	}

	static parse(stream: Stream): CaseInsensitiveMap<string | undefined> {
		return new JsonConfigFileParser().parseStream(stream);
	}
}
