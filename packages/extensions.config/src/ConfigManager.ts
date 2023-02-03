import { IDisposable, IList, List } from '@yohira/base';
import {
	IConfigBuilder,
	IConfigProvider,
	IConfigRoot,
	IConfigSection,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';

import { ConfigRoot } from './ConfigRoot';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationManager.cs,9fd7bcd9fe6aeaa6,references
export class ConfigManager implements IConfigBuilder, IConfigRoot, IDisposable {
	// HACK: https://github.com/dotnet/runtime/blob/a490a3417adb78dbc36891624e67720ebdca919f/src/libraries/Microsoft.Extensions.Configuration/src/ConfigurationManager.cs#L23
	private readonly _providers = new List<IConfigProvider>();

	get(key: string): string | undefined {
		return ConfigRoot.getConfig(this._providers /* TODO */, key);
	}

	set(key: string, value: string | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	getSection(key: string): IConfigSection {
		// TODO
		throw new Error('Method not implemented.');
	}

	getChildren(): IConfigSection[] {
		// TODO
		throw new Error('Method not implemented.');
	}

	get properties(): Map<string, unknown> {
		// TODO
		throw new Error('Method not implemented.');
	}

	get sources(): IList<IConfigSource> {
		// TODO
		throw new Error('Method not implemented.');
	}

	get providers(): Iterable<IConfigProvider> {
		// REVIEW: lock
		const providers = new List<IConfigProvider>();
		providers.addRange(this._providers);
		return providers;
	}

	dispose(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	add(source: IConfigSource): this {
		// TODO
		throw new Error('Method not implemented.');
	}

	buildSync(): IConfigRoot {
		// TODO
		throw new Error('Method not implemented.');
	}

	reloadSync(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
