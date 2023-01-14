import { addConfigSource } from '@yohira/extensions.config.abstractions/ConfigExtensions';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { JsonConfigSource } from '@yohira/extensions.config.json/JsonConfigSource';
import { JsonStreamConfigSource } from '@yohira/extensions.config.json/JsonStreamConfigSource';
import { IFileProvider } from '@yohira/extensions.file-providers/IFileProvider';
import { Stream } from 'node:stream';

function addJsonFileCore(
	builder: IConfigBuilder,
	configureSource: ((source: JsonConfigSource) => void) | undefined,
): IConfigBuilder {
	return addConfigSource(JsonConfigSource, builder, configureSource);
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationExtensions.cs,e700239ce626d5e9,references
export function addJsonFile(
	builder: IConfigBuilder,
	provider: IFileProvider | undefined,
	path: string,
	optional: boolean,
	reloadOnChange: boolean,
): IConfigBuilder {
	if (!path) {
		throw new Error('File path must be a non-empty string.' /* LOC */);
	}

	return addJsonFileCore(builder, (source) => {
		source.fileProvider = provider;
		source.path = path;
		source.optional = optional;
		// TODO: source.reloadOnChange = reloadOnChange;
		// TODO: source.resolveFileProvider();
	});
}

export function addJsonStream(
	builder: IConfigBuilder,
	stream: Stream,
): IConfigBuilder {
	return addConfigSource(JsonStreamConfigSource, builder, (source) => {
		source.stream = stream;
	});
}
