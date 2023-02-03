import { IList, List } from '@yohira/base';
import {
	IConfigBuilder,
	IConfigProvider,
	IConfigRoot,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';

import { ConfigRoot } from './ConfigRoot';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationBuilder.cs,9307fd255b09cfff,references
export class ConfigBuilder implements IConfigBuilder {
	readonly sources: IList<IConfigSource> = new List<IConfigSource>();
	readonly properties = new Map<string, unknown>();

	add(source: IConfigSource): this {
		this.sources.add(source);
		return this;
	}

	buildSync(): IConfigRoot {
		const providers = new List<IConfigProvider>();
		for (const source of this.sources) {
			const provider = source.build(this);
			providers.add(provider);
		}
		return new ConfigRoot(providers);
	}
}
