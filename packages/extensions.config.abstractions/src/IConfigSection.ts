import { IConfig } from '@/IConfig';

export interface IConfigSection extends IConfig {
	readonly key: string;
	readonly path: string;
	value: string | undefined;
}
