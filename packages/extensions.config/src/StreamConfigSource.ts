import {
	IConfigBuilder,
	IConfigProvider,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';
import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.Extensions.Configuration/StreamConfigurationSource.cs,0e99d12e5c373e47,references
export abstract class StreamConfigSource implements IConfigSource {
	stream?: Stream;

	abstract build(builder: IConfigBuilder): IConfigProvider;
}
