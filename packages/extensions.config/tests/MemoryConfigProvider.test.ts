import { IConfigProvider } from '@yohira/extensions.config.abstractions';

import {
	ConfigProviderTestBase,
	TestSection,
	nullsTestConfig,
	testConfigProvider,
} from './ConfigProviderTestBase';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationProviderMemoryTest.cs#L8
class ConfigProviderMemoryTest extends ConfigProviderTestBase {
	async Null_values_are_included_in_the_config(): Promise<void> {
		this.assertConfig(
			await this.buildConfigRoot(
				this.loadThroughProvider(nullsTestConfig),
			),
			true,
		);
	}

	protected loadThroughProvider(testConfig: TestSection): {
		provider: IConfigProvider;
		initializer: () => Promise<void>;
	} {
		return this.loadUsingMemoryProvider(testConfig);
	}
}

testConfigProvider(new ConfigProviderMemoryTest());
