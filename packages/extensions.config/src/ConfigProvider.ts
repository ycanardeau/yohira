import { tryGetValue } from '@yohira/base/MapExtensions';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { Result } from '@yohira/third-party.ts-results/result';

// https://source.dot.net/#Microsoft.Extensions.Configuration/ConfigurationProvider.cs,5c6e786dde478171,references
export abstract class ConfigProvider implements IConfigProvider {
	protected data = new Map<string, string | undefined>();

	protected constructor() {}

	tryGet = (key: string): Result<string | undefined, undefined> => {
		return tryGetValue(this.data, key);
	};

	set = (key: string, value: string | undefined): void => {
		this.data.set(key, value);
	};
}
