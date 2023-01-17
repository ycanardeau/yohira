import { IDisposable, IList } from '@yohira/base';
import {
	IConfigProvider,
	IConfigRoot,
	IConfigSection,
} from '@yohira/extensions.config.abstractions';

import { ConfigSection } from './ConfigSection';
import { getChildrenImpl } from './InternalConfigRootExtensions';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationRoot.cs,0a5ad779923b882b,references
export class ConfigRoot implements IConfigRoot, IDisposable {
	constructor(private readonly _providers: IList<IConfigProvider>) {
		// TODO
		for (const provider of _providers) {
			provider.load();
			// TODO
		}
	}

	get providers(): Iterable<IConfigProvider> {
		return this._providers;
	}

	static getConfig(
		providers: IList<IConfigProvider>,
		key: string,
	): string | undefined {
		for (let i = providers.count - 1; i >= 0; i--) {
			const provider = providers.get(i);

			const tryGetResult = provider.tryGet(key);
			if (tryGetResult.ok) {
				return tryGetResult.val;
			}
		}

		return undefined;
	}

	static setConfig(
		providers: IList<IConfigProvider>,
		key: string,
		value: string | undefined,
	): void {
		if (providers.count === 0) {
			throw new Error(
				'A configuration source is not registered. Please register one before setting a value.' /* LOC */,
			);
		}

		for (const provider of providers) {
			provider.set(key, value);
		}
	}

	get(key: string): string | undefined {
		return ConfigRoot.getConfig(this._providers, key);
	}

	set(key: string, value: string | undefined): void {
		ConfigRoot.setConfig(this._providers, key, value);
	}

	getChildren(): IConfigSection[] {
		return getChildrenImpl(this, undefined);
	}

	getSection(key: string): IConfigSection {
		return new ConfigSection(this, key);
	}

	private raiseChanged(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	reload(): void {
		for (const provider of this._providers) {
			provider.load();
		}
		this.raiseChanged();
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
