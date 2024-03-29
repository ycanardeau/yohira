import { Result } from '@yohira/third-party.ts-results';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfigurationProvider.cs,fe690d814b90618a,references
export interface IConfigProvider {
	tryGet(key: string): Result<string | undefined, undefined>;
	set(key: string, value: string | undefined): void;
	loadSync(): void;
	getChildKeys(
		earlierKeys: string[],
		parentPath: string | undefined,
	): string[];
	toString(): string;
}
