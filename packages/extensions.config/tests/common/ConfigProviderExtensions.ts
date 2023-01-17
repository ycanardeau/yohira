import { IConfigProvider } from '@yohira/extensions.config.abstractions';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/Common/ConfigurationProviderExtensions.cs#L10
export function get(provider: IConfigProvider, key: string): string {
	const tryGetResult = provider.tryGet(key);
	if (!tryGetResult.ok) {
		throw new Error('Key not found');
	}
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return tryGetResult.val!;
}
