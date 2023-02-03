import { IConfig } from './IConfig';
import { IConfigProvider } from './IConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfigurationRoot.cs,27c43b3b22f5bb8b,references
export interface IConfigRoot extends IConfig {
	reloadSync(): void;
	readonly providers: Iterable<IConfigProvider>;
}
