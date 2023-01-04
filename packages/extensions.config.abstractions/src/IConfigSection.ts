import { IConfig } from '@yohira/extensions.config.abstractions/IConfig';

export interface IConfigSection extends IConfig {
	readonly key: string;
	readonly path: string;
	value: string | undefined;
}
