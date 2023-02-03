import { IConfigProvider } from '@yohira/extensions.config.abstractions';

import {
	ConfigProviderTestBase,
	TestSection,
	nullsTestConfig,
	testConfigProvider,
} from './ConfigProviderTestBase';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationProviderMemoryTest.cs#L8
class ConfigProviderMemoryTest extends ConfigProviderTestBase {
	Null_values_are_included_in_the_config(): void {
		this.assertConfig(
			this.buildConfigRoot(this.loadThroughProviderSync(nullsTestConfig)),
			true,
		);
	}

	protected loadThroughProviderSync(testConfig: TestSection): {
		provider: IConfigProvider;
		initializer: () => void;
	} {
		return this.loadUsingMemoryProviderSync(testConfig);
	}
}

testConfigProvider(new ConfigProviderMemoryTest());
