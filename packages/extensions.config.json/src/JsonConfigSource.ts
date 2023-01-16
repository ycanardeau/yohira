import { JsonConfigProvider } from '@/JsonConfigProvider';
import {
	IConfigBuilder,
	IConfigProvider,
} from '@yohira/extensions.config.abstractions';
import { FileConfigSource } from '@yohira/extensions.config.file-extensions';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Json/JsonConfigurationSource.cs,684263f40a9dc058,references
export class JsonConfigSource extends FileConfigSource {
	build(builder: IConfigBuilder): IConfigProvider {
		this.ensureDefaults(builder);
		return new JsonConfigProvider(this);
	}
}
