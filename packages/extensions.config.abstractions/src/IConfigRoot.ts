import { IConfig } from '@yohira/extensions.config.abstractions/IConfig';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfigurationRoot.cs,27c43b3b22f5bb8b,references
export interface IConfigRoot extends IConfig {
	reload(): void;
	readonly providers: Iterable<IConfigProvider>;
}
