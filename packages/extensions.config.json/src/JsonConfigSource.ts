import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { FileConfigSource } from '@yohira/extensions.config.file-extensions/FileConfigSource';
import { JsonConfigProvider } from '@yohira/extensions.config.json/JsonConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationSource.cs,684263f40a9dc058,references
export class JsonConfigSource extends FileConfigSource {
	build(builder: IConfigBuilder): IConfigProvider {
		this.ensureDefaults(builder);
		return new JsonConfigProvider(this);
	}
}
