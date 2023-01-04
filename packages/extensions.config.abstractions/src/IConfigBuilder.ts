import { IList } from '@yohira/base/IList';
import { IConfigRoot } from '@yohira/extensions.config.abstractions/IConfigRoot';
import { IConfigSource } from '@yohira/extensions.config.abstractions/IConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfigurationBuilder.cs,f813011dcffaa972,references
export interface IConfigBuilder {
	get sources(): IList<IConfigSource>;
	add(source: IConfigSource): this;
	build(): IConfigRoot;
}
