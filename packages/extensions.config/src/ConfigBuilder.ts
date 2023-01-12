import { IList } from '@yohira/base/IList';
import { List } from '@yohira/base/List';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { IConfigRoot } from '@yohira/extensions.config.abstractions/IConfigRoot';
import { IConfigSource } from '@yohira/extensions.config.abstractions/IConfigSource';
import { ConfigRoot } from '@yohira/extensions.config/ConfigRoot';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationBuilder.cs,9307fd255b09cfff,references
export class ConfigBuilder implements IConfigBuilder {
	readonly sources: IList<IConfigSource> = new List<IConfigSource>();

	add(source: IConfigSource): this {
		this.sources.add(source);
		return this;
	}

	build(): IConfigRoot {
		const providers = new List<IConfigProvider>();
		for (const source of this.sources) {
			const provider = source.build(this);
			providers.add(provider);
		}
		return new ConfigRoot(providers);
	}
}
