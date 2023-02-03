import { IDisposable, IList, List } from '@yohira/base';
import {
	IConfigBuilder,
	IConfigProvider,
	IConfigRoot,
	IConfigSection,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';

import { ConfigRoot } from './ConfigRoot';
import { MemoryConfigSource } from './MemoryConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationManager.cs,91805a47b21b43d2,references
class ConfigSources implements IList<IConfigSource> {
	private readonly sources = new List<IConfigSource>();

	constructor(private readonly config: ConfigManager) {}

	get(index: number): IConfigSource {
		return this.sources.get(index);
	}

	set(index: number, source: IConfigSource): void {
		this.sources.set(index, source);
		this.config.reloadSourcesSync();
	}

	get count(): number {
		return this.sources.count;
	}

	get isReadonly(): boolean {
		return this.sources.isReadonly;
	}

	add(source: IConfigSource): void {
		this.sources.add(source);
		this.config.addSourceSync(source);
	}

	clear(): void {
		this.sources.clear();
		this.config.reloadSourcesSync();
	}

	contains(source: IConfigSource): boolean {
		return this.sources.contains(source);
	}

	insert(index: number, source: IConfigSource): void {
		this.sources.insert(index, source);
		this.config.reloadSourcesSync();
	}

	remove(source: IConfigSource): boolean {
		const removed = this.sources.remove(source);
		this.config.reloadSourcesSync();
		return removed;
	}

	removeAt(index: number): void {
		this.sources.removeAt(index);
		this.config.reloadSourcesSync();
	}

	[Symbol.iterator](): Iterator<IConfigSource, any, undefined> {
		return this.sources[Symbol.iterator]();
	}
}

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationManager.cs,9fd7bcd9fe6aeaa6,references
export class ConfigManager implements IConfigBuilder, IConfigRoot, IDisposable {
	private readonly _sources: ConfigSources;
	// HACK: https://github.com/dotnet/runtime/blob/a490a3417adb78dbc36891624e67720ebdca919f/src/libraries/Microsoft.Extensions.Configuration/src/ConfigurationManager.cs#L23
	private readonly _providers = new List<IConfigProvider>();

	constructor() {
		this._sources = new ConfigSources(this);
		// TODO: this._properties

		this._sources.add(new MemoryConfigSource());
	}

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
		return this._sources;
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
		this._sources.add(source);
		return this;
	}

	buildSync(): IConfigRoot {
		// TODO
		throw new Error('Method not implemented.');
	}

	reloadSync(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private raiseChanged(): void {
		// TODO
	}

	/** @internal */ addSourceSync(source: IConfigSource): void {
		const provider = source.build(this);

		provider.loadSync();
		// TODO

		// TODO
		this.raiseChanged();
	}

	/** @internal */ reloadSourcesSync(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
