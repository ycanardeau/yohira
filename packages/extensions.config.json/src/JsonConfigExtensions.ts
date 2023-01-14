import { addConfigSource } from '@yohira/extensions.config.abstractions/ConfigExtensions';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { JsonStreamConfigSource } from '@yohira/extensions.config.json/JsonStreamConfigSource';
import { Stream } from 'node:stream';

export function addJsonStream(
	builder: IConfigBuilder,
	stream: Stream,
): IConfigBuilder {
	return addConfigSource(JsonStreamConfigSource, builder, (source) => {
		source.stream = stream;
	});
}
