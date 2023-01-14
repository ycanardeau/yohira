import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { JsonStreamConfigProvider } from '@yohira/extensions.config.json/JsonStreamConfigProvider';
import { StreamConfigSource } from '@yohira/extensions.config/StreamConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonStreamConfigurationSource.cs,2be82f6becf52403,references
export class JsonStreamConfigSource extends StreamConfigSource {
	build(builder: IConfigBuilder): IConfigProvider {
		return new JsonStreamConfigProvider(this);
	}
}
