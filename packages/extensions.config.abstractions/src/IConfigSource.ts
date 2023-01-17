import { IConfigBuilder } from './IConfigBuilder';
import { IConfigProvider } from './IConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfigurationSource.cs,cd6b3a165b1a62ca,references
export interface IConfigSource {
	build(builder: IConfigBuilder): IConfigProvider;
}
