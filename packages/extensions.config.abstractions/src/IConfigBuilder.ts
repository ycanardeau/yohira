import { IList } from '@yohira/base';

import { IConfigRoot } from './IConfigRoot';
import { IConfigSource } from './IConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfigurationBuilder.cs,f813011dcffaa972,references
export interface IConfigBuilder {
	readonly properties: Map<string, unknown>;
	readonly sources: IList<IConfigSource>;
	add(source: IConfigSource): this;
	build(): Promise<IConfigRoot>;
}
