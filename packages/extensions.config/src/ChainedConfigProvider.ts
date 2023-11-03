import { IDisposable } from '@yohira/base';
import {
	IConfig,
	IConfigProvider,
} from '@yohira/extensions.config.abstractions';
import { Err, Ok, Result } from '@yohira/third-party.ts-results';

import { ChainedConfigSource } from './ChainedConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ChainedConfigurationProvider.cs,2bf7ba944b788eb3,references
export class ChainedConfigProvider implements IConfigProvider, IDisposable {
	readonly config: IConfig;

	constructor(source: ChainedConfigSource) {
		if (source.config === undefined) {
			throw new Error(
				`Undefined is not a valid value for 'source.config'.` /* LOC */,
			);
		}
		this.config = source.config;
	}

	tryGet(key: string): Result<string | undefined, undefined> {
		const value = this.config.get(key);
		if (value) {
			return new Ok(value);
		} else {
			return new Err(undefined);
		}
	}

	set(key: string, value: string | undefined): void {
		this.config.set(key, value);
	}

	loadSync(): void {}

	getChildKeys(
		earlierKeys: string[],
		parentPath: string | undefined,
	): string[] {
		const section =
			parentPath === undefined
				? this.config
				: this.config.getSection(parentPath);
		const keys: string[] = [];
		for (const child of section.getChildren()) {
			keys.push(child.key);
		}
		keys.push(...earlierKeys);
		// TODO: sort
		return keys;
	}

	[Symbol.dispose](): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
