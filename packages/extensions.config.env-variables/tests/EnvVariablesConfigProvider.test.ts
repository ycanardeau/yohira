import { List } from '@yohira/base';
import { IConfigProvider } from '@yohira/extensions.config.abstractions';
import { EnvVariablesConfigProvider } from '@yohira/extensions.config.env-variables';

import {
	ConfigProviderTestBase,
	TestSection,
	nullsTestConfig,
	testConfigProvider,
} from '../../extensions.config/tests/ConfigProviderTestBase';

class ConfigProviderEnvVariablesTest extends ConfigProviderTestBase {
	protected loadThroughProvider(testConfig: TestSection): {
		provider: IConfigProvider;
		initializer: () => void;
	} {
		const values = new List<[string, string]>();
		ConfigProviderTestBase.sectionToValues(testConfig, '', values);

		const provider = new EnvVariablesConfigProvider(undefined);

		return {
			provider: provider,
			initializer: () => provider.loadCore(Object.fromEntries(values)),
		};
	}

	// TODO: Load_from_single_provider_with_differing_case_duplicates_throws(): void {}

	Null_values_are_included_in_the_config(): void {
		this.assertConfig(
			this.buildConfigRoot(this.loadThroughProvider(nullsTestConfig)),
			true,
		);
	}
}

testConfigProvider(new ConfigProviderEnvVariablesTest());
