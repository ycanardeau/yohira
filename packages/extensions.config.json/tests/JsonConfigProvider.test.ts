import { IConfigProvider } from '@yohira/extensions.config.abstractions';
import {
	JsonConfigProvider,
	JsonConfigSource,
} from '@yohira/extensions.config.json';
import JSON5 from 'json5';
import { Readable } from 'node:stream';

import {
	ConfigProviderTestBase,
	TestSection,
	testConfigProvider,
} from '../../extensions.config/tests/ConfigProviderTestBase';

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/ConfigurationProviderJsonTest.cs#L13
class ConfigProviderJsonTest extends ConfigProviderTestBase {
	private sectionToJson(
		jsonBuilder: string[],
		section: TestSection,
		includeComma = true,
	): void {
		function valueToJson(value: string | undefined): string {
			return value === undefined ? 'null' : `"${value}"`;
		}

		jsonBuilder.push('{', '\n');

		for (const [key, value] of Object.entries(section.values)) {
			jsonBuilder.push(
				typeof value.value === 'string' ||
					typeof value.value === 'undefined'
					? `"${key}": ${valueToJson(value.value)},`
					: `"${key}": [${value.value.map(valueToJson).join(', ')}],`,
				'\n',
			);
		}

		for (const [key, subsection] of Object.entries(section.sections)) {
			jsonBuilder.push(`"${key}": `);
			this.sectionToJson(jsonBuilder, subsection);
		}

		if (includeComma) {
			jsonBuilder.push('},', '\n');
		} else {
			jsonBuilder.push('}', '\n');
		}
	}

	protected loadThroughProvider(testConfig: TestSection): {
		provider: IConfigProvider;
		initializer: () => Promise<void>;
	} {
		const jsonBuilder: string[] = [];
		this.sectionToJson(jsonBuilder, testConfig, false);

		const source = new JsonConfigSource();
		source.optional = true;
		const provider = new JsonConfigProvider(source);

		let json = jsonBuilder.join('');
		json = JSON5.stringify(JSON5.parse(json));
		return {
			provider: provider,
			initializer: () => provider.loadStream(Readable.from(json)),
		};
	}

	// TODO: Load_from_single_provider_with_duplicates_throws
}

testConfigProvider(new ConfigProviderJsonTest());
