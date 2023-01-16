import { JsonStreamConfigProvider } from '@/JsonStreamConfigProvider';
import { StreamConfigSource } from '@yohira/extensions.config';
import {
	IConfigBuilder,
	IConfigProvider,
} from '@yohira/extensions.config.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonStreamConfigurationSource.cs,2be82f6becf52403,references
export class JsonStreamConfigSource extends StreamConfigSource {
	build(builder: IConfigBuilder): IConfigProvider {
		return new JsonStreamConfigProvider(this);
	}
}
