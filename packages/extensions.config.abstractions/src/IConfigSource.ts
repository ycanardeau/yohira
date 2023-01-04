import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfigurationSource.cs,cd6b3a165b1a62ca,references
export interface IConfigSource {
	build(builder: IConfigBuilder): IConfigProvider;
}
