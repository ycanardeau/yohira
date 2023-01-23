import {
	CaseInsensitiveMap,
	indexOfIgnoreCase,
	startsWithIgnoreCase,
	tryGetValue,
} from '@yohira/base';
import {
	IConfigProvider,
	keyDelimiter,
} from '@yohira/extensions.config.abstractions';
import { Result } from '@yohira/third-party.ts-results';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationProvider.cs,5c6e786dde478171,references
export abstract class ConfigProvider implements IConfigProvider {
	protected data = new CaseInsensitiveMap<string | undefined>();

	protected constructor() {}

	tryGet(key: string): Result<string | undefined, undefined> {
		return tryGetValue(this.data, key);
	}

	set(key: string, value: string | undefined): void {
		this.data.set(key, value);
	}

	load(): Promise<void> {
		return Promise.resolve();
	}

	private static segment(key: string, prefixLength: number): string {
		const indexOf = indexOfIgnoreCase(key, keyDelimiter, prefixLength);
		return indexOf < 0
			? key.substring(prefixLength)
			: key.substring(prefixLength, indexOf);
	}

	getChildKeys(
		earlierKeys: string[],
		parentPath: string | undefined,
	): string[] {
		const results: string[] = [];

		if (parentPath === undefined) {
			for (const [key] of this.data) {
				results.push(ConfigProvider.segment(key, 0));
			}
		} else {
			if (keyDelimiter !== ':') {
				throw new Error('Assertion failed.');
			}

			for (const [key] of this.data) {
				if (
					key.length > parentPath.length &&
					startsWithIgnoreCase(key, parentPath) &&
					key[parentPath.length] === ':'
				) {
					results.push(
						ConfigProvider.segment(key, parentPath.length + 1),
					);
				}
			}
		}

		results.push(...earlierKeys);

		results.sort();

		return results;
	}

	toString(): string {
		return this.constructor.name;
	}
}
