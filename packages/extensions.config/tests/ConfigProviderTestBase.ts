import { IList, List } from '@yohira/base';
import {
	ConfigRoot,
	MemoryConfigProvider,
	MemoryConfigSource,
} from '@yohira/extensions.config';
import {
	IConfigProvider,
	IConfigRoot,
	getDebugView,
} from '@yohira/extensions.config.abstractions';
import { expect, test } from 'vitest';

// TODO: Move.
function toList<T>(items: T[]): IList<T> {
	const list = new List<T>();
	list.addRange(items);
	return list;
}

class TestKeyValue {
	private constructor(
		readonly value: (string | undefined) | (string | undefined)[],
	) {}

	static from(value: TestKeyValue['value']): TestKeyValue {
		return new TestKeyValue(value);
	}

	*expand(key: string): Generator<[string, string | undefined]> {
		if (
			typeof this.value === 'string' ||
			typeof this.value === 'undefined'
		) {
			yield [key, this.value];
		} else {
			for (let i = 0; i < this.value.length; i++) {
				yield [`${key}:${i}`, this.value[i]];
			}
		}
	}
}

export interface TestSection {
	values: Record<string, TestKeyValue>;
	sections: Record<string, TestSection>;
}

const testConfig: TestSection = {
	values: { Key1: TestKeyValue.from('Value1') },
	sections: {
		Section1: {
			values: { Key2: TestKeyValue.from('Value12') },
			sections: {
				Section2: {
					values: {
						Key3: TestKeyValue.from('Value123'),
						Key3a: TestKeyValue.from([
							'ArrayValue0',
							'ArrayValue1',
							'ArrayValue2',
						]),
					},
					sections: {},
				},
			},
		},
		Section3: {
			values: {},
			sections: {
				Section4: {
					values: { Key4: TestKeyValue.from('Value344') },
					sections: {},
				},
			},
		},
	},
};

const noValuesTestConfig: TestSection = {
	values: { Key1: TestKeyValue.from('------') },
	sections: {
		Section1: {
			values: { Key2: TestKeyValue.from('-------') },
			sections: {
				Section2: {
					values: {
						Key3: TestKeyValue.from('-----'),
						Key3a: TestKeyValue.from([
							'-----------',
							'-----------',
							'-----------',
						]),
					},
					sections: {},
				},
			},
		},
		Section3: {
			values: {},
			sections: {
				Section4: {
					values: { Key4: TestKeyValue.from('--------') },
					sections: {},
				},
			},
		},
	},
};

const missingSection2ValuesConfig: TestSection = {
	values: { Key1: TestKeyValue.from('Value1') },
	sections: {
		Section1: {
			values: { Key2: TestKeyValue.from('Value12') },
			sections: {
				Section2: {
					values: {
						Key3a: TestKeyValue.from(['ArrayValue0']),
					},
					sections: {},
				},
			},
		},
		Section3: {
			values: {},
			sections: {
				Section4: {
					values: { Key4: TestKeyValue.from('Value344') },
					sections: {},
				},
			},
		},
	},
};

const missingSection4Config: TestSection = {
	values: { Key1: TestKeyValue.from('Value1') },
	sections: {
		Section1: {
			values: { Key2: TestKeyValue.from('Value12') },
			sections: {
				Section2: {
					values: {
						Key3: TestKeyValue.from('Value123'),
						Key3a: TestKeyValue.from([
							'ArrayValue0',
							'ArrayValue1',
							'ArrayValue2',
						]),
					},
					sections: {},
				},
			},
		},
		Section3: {
			values: {},
			sections: {},
		},
	},
};

const differentCasedTestConfig: TestSection = {
	values: { KeY1: TestKeyValue.from('Value1') },
	sections: {
		SectioN1: {
			values: { KeY2: TestKeyValue.from('Value12') },
			sections: {
				SectioN2: {
					values: {
						KeY3: TestKeyValue.from('Value123'),
						KeY3a: TestKeyValue.from([
							'ArrayValue0',
							'ArrayValue1',
							'ArrayValue2',
						]),
					},
					sections: {},
				},
			},
		},
		SectioN3: {
			values: {},
			sections: {
				SectioN4: {
					values: { KeY4: TestKeyValue.from('Value344') },
					sections: {},
				},
			},
		},
	},
};

export const nullsTestConfig: TestSection = {
	values: { Key1: TestKeyValue.from(undefined) },
	sections: {
		Section1: {
			values: { Key2: TestKeyValue.from(undefined) },
			sections: {
				Section2: {
					values: {
						Key3: TestKeyValue.from(undefined),
						Key3a: TestKeyValue.from([
							undefined,
							undefined,
							undefined,
						]),
					},
					sections: {},
				},
			},
		},
		Section3: {
			values: {},
			sections: {
				Section4: {
					values: { Key4: TestKeyValue.from(undefined) },
					sections: {},
				},
			},
		},
	},
};

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationProviderTestBase.cs#L12
export abstract class ConfigProviderTestBase {
	protected static sectionToValues(
		section: TestSection,
		sectionName: string,
		values: IList<[string, string | undefined]>,
	): void {
		for (const [key, value] of Object.entries(section.values).flatMap(
			([key, value]) => Array.from(value.expand(key)),
		)) {
			values.add([sectionName + key, value]);
		}

		for (const [key, subsection] of Object.entries(section.sections)) {
			ConfigProviderTestBase.sectionToValues(
				subsection,
				sectionName + key + ':',
				values,
			);
		}
	}

	protected loadUsingMemoryProviderSync(testConfig: TestSection): {
		provider: IConfigProvider;
		initializer: () => void;
	} {
		const values = new List<[string, string]>();
		ConfigProviderTestBase.sectionToValues(testConfig, '', values);

		return {
			provider: new MemoryConfigProvider(
				new MemoryConfigSource(Object.fromEntries(values)),
			),
			initializer: (): void => {},
		};
	}

	protected abstract loadThroughProviderSync(testConfig: TestSection): {
		provider: IConfigProvider;
		initializer: () => void;
	};

	protected buildConfigRoot(
		...providers: {
			provider: IConfigProvider;
			initializer: () => void;
		}[]
	): IConfigRoot {
		const root = new ConfigRoot(toList(providers.map((e) => e.provider)));

		for (const initializer of providers.map((e) => e.initializer)) {
			initializer();
		}

		return root;
	}

	protected assertDebugView(config: IConfigRoot, expected: string): void {
		function removeLineEnds(source: string): string {
			return source.replaceAll('\n', '').replaceAll('\r', '');
		}

		const actual = getDebugView(config);

		expect(removeLineEnds(actual)).toBe(removeLineEnds(expected));
	}

	protected assertConfig(
		config: IConfigRoot,
		expectNulls = false,
		nullValue?: string,
	): void {
		const value1 = expectNulls ? nullValue : 'Value1';
		const value12 = expectNulls ? nullValue : 'Value12';
		const value123 = expectNulls ? nullValue : 'Value123';
		const arrayvalue0 = expectNulls ? nullValue : 'ArrayValue0';
		const arrayvalue1 = expectNulls ? nullValue : 'ArrayValue1';
		const arrayvalue2 = expectNulls ? nullValue : 'ArrayValue2';
		const value344 = expectNulls ? nullValue : 'Value344';

		// TODO: ignore case
		expect(config.get('Key1')).toBe(value1);
		expect(config.get('Section1:Key2')).toBe(value12);
		expect(config.get('Section1:Section2:Key3')).toBe(value123);
		expect(config.get('Section1:Section2:Key3a:0')).toBe(arrayvalue0);
		expect(config.get('Section1:Section2:Key3a:1')).toBe(arrayvalue1);
		expect(config.get('Section1:Section2:Key3a:2')).toBe(arrayvalue2);
		expect(config.get('Section3:Section4:Key4')).toBe(value344);

		// TODO: ignore case
		const section1 = config.getSection('Section1');
		expect(section1.get('Key2')).toBe(value12);
		expect(section1.get('Section2:Key3')).toBe(value123);
		expect(section1.get('Section2:Key3a:0')).toBe(arrayvalue0);
		expect(section1.get('Section2:Key3a:1')).toBe(arrayvalue1);
		expect(section1.get('Section2:Key3a:2')).toBe(arrayvalue2);
		expect(section1.path).toBe('Section1');
		expect(section1.value).toBeUndefined();

		// TODO: ignore case
		let section2 = config.getSection('Section1:Section2');
		expect(section2.get('Key3')).toBe(value123);
		expect(section2.get('Key3a:0')).toBe(arrayvalue0);
		expect(section2.get('Key3a:1')).toBe(arrayvalue1);
		expect(section2.get('Key3a:2')).toBe(arrayvalue2);
		expect(section2.path).toBe('Section1:Section2');
		expect(section2.value).toBeUndefined();

		// TODO: ignore case
		section2 = section1.getSection('Section2');
		expect(section2.get('Key3')).toBe(value123);
		expect(section2.get('Key3a:0')).toBe(arrayvalue0);
		expect(section2.get('Key3a:1')).toBe(arrayvalue1);
		expect(section2.get('Key3a:2')).toBe(arrayvalue2);
		expect(section2.path).toBe('Section1:Section2');
		expect(section2.value).toBeUndefined();

		// TODO: ignore case
		const section3a = section2.getSection('Key3a');
		expect(section3a.get('0')).toBe(arrayvalue0);
		expect(section3a.get('1')).toBe(arrayvalue1);
		expect(section3a.get('2')).toBe(arrayvalue2);
		expect(section3a.path).toBe('Section1:Section2:Key3a');
		expect(section3a.value).toBeUndefined();

		// TODO: ignore case
		const section3 = config.getSection('Section3');
		expect(section3.path).toBe('Section3');
		expect(section3.value).toBeUndefined();

		// TODO: ignore case
		let section4 = config.getSection('Section3:Section4');
		expect(section4.get('Key4')).toBe(value344);
		expect(section4.path).toBe('Section3:Section4');
		expect(section4.value).toBeUndefined();

		// TODO: ignore case
		section4 = config.getSection('Section3').getSection('Section4');
		expect(section4.get('Key4')).toBe(value344);
		expect(section4.path).toBe('Section3:Section4');
		expect(section4.value).toBeUndefined();

		let sections = config.getChildren(); /* TODO: toList */

		expect(sections.length).toBe(3);

		// TODO: ignore case
		expect(sections[0].key.toLowerCase()).toBe('Key1'.toLowerCase());
		expect(sections[0].path.toLowerCase()).toBe('Key1'.toLowerCase());
		expect(sections[0].value).toBe(value1);

		// TODO: ignore case
		expect(sections[1].key.toLowerCase()).toBe('Section1'.toLowerCase());
		expect(sections[1].path.toLowerCase()).toBe('Section1'.toLowerCase());
		expect(sections[1].value).toBeUndefined();

		// TODO: ignore case
		expect(sections[2].key.toLowerCase()).toBe('Section3'.toLowerCase());
		expect(sections[2].path.toLowerCase()).toBe('Section3'.toLowerCase());
		expect(sections[2].value).toBeUndefined();

		sections = section1.getChildren(); /* TODO: toList */

		expect(sections.length).toBe(2);

		// TODO: ignore case
		expect(sections[0].key.toLowerCase()).toBe('Key2'.toLowerCase());
		expect(sections[0].path.toLowerCase()).toBe(
			'Section1:Key2'.toLowerCase(),
		);
		expect(sections[0].value).toBe(value12);

		// TODO: ignore case
		expect(sections[1].key.toLowerCase()).toBe('Section2'.toLowerCase());
		expect(sections[1].path.toLowerCase()).toBe(
			'Section1:Section2'.toLowerCase(),
		);
		expect(sections[1].value).toBeUndefined();

		sections = section2.getChildren(); /* TODO: toList */

		expect(sections.length).toBe(2);

		// TODO: ignore case
		expect(sections[0].key.toLowerCase()).toBe('Key3'.toLowerCase());
		expect(sections[0].path.toLowerCase()).toBe(
			'Section1:Section2:Key3'.toLowerCase(),
		);
		expect(sections[0].value).toBe(value123);

		// TODO: ignore case
		expect(sections[1].key.toLowerCase()).toBe('Key3a'.toLowerCase());
		expect(sections[1].path.toLowerCase()).toBe(
			'Section1:Section2:Key3a'.toLowerCase(),
		);
		expect(sections[1].value).toBeUndefined();

		sections = section3a.getChildren(); /* TODO: toList */

		expect(sections.length).toBe(3);

		// TODO: ignore case
		expect(sections[0].key).toBe('0');
		expect(sections[0].path).toBe('Section1:Section2:Key3a:0');
		expect(sections[0].value).toBe(arrayvalue0);

		// TODO: ignore case
		expect(sections[1].key).toBe('1');
		expect(sections[1].path).toBe('Section1:Section2:Key3a:1');
		expect(sections[1].value).toBe(arrayvalue1);

		// TODO: ignore case
		expect(sections[2].key).toBe('2');
		expect(sections[2].path).toBe('Section1:Section2:Key3a:2');
		expect(sections[2].value).toBe(arrayvalue2);

		sections = section3.getChildren(); /* TODO: toList */

		expect(sections.length).toBe(1);

		// TODO: ignore case
		expect(sections[0].key.toLowerCase()).toBe('Section4'.toLowerCase());
		expect(sections[0].path.toLowerCase()).toBe(
			'Section3:Section4'.toLowerCase(),
		);
		expect(sections[0].value).toBeUndefined();

		sections = section4.getChildren(); /* TODO: toList */

		expect(sections.length).toBe(1);

		// TODO: ignore case
		expect(sections[0].key.toLowerCase()).toBe('Key4'.toLowerCase());
		expect(sections[0].path.toLowerCase()).toBe(
			'Section3:Section4:Key4'.toLowerCase(),
		);
		expect(sections[0].value).toBe(value344);
	}

	Load_from_single_provider(): void {
		const configRoot = this.buildConfigRoot(
			this.loadThroughProviderSync(testConfig),
		);

		this.assertConfig(configRoot);
	}

	Has_debug_view(): void {
		const configRoot = this.buildConfigRoot(
			this.loadThroughProviderSync(testConfig),
		);
		const providerTag = Array.from(configRoot.providers)[0].toString();

		const expected = `key1=Value1 (${providerTag})
section1:
  key2=Value12 (${providerTag})
  section2:
    key3=Value123 (${providerTag})
    key3a:
      0=ArrayValue0 (${providerTag})
      1=ArrayValue1 (${providerTag})
      2=ArrayValue2 (${providerTag})
section3:
  section4:
    key4=Value344 (${providerTag})
`;

		this.assertDebugView(configRoot, expected);
	}

	Null_values_are_included_in_the_config(): void {
		this.assertConfig(
			this.buildConfigRoot(this.loadThroughProviderSync(nullsTestConfig)),
			true,
			'',
		);
	}

	Combine_after_other_provider(): void {
		this.assertConfig(
			this.buildConfigRoot(
				this.loadUsingMemoryProviderSync(missingSection2ValuesConfig),
				this.loadThroughProviderSync(missingSection4Config),
			),
		);

		this.assertConfig(
			this.buildConfigRoot(
				this.loadUsingMemoryProviderSync(missingSection4Config),
				this.loadThroughProviderSync(missingSection2ValuesConfig),
			),
		);
	}

	Combine_before_other_provider(): void {
		this.assertConfig(
			this.buildConfigRoot(
				this.loadThroughProviderSync(missingSection2ValuesConfig),
				this.loadUsingMemoryProviderSync(missingSection4Config),
			),
		);

		this.assertConfig(
			this.buildConfigRoot(
				this.loadThroughProviderSync(missingSection4Config),
				this.loadUsingMemoryProviderSync(missingSection2ValuesConfig),
			),
		);
	}

	Second_provider_overrides_values_from_first(): void {
		this.assertConfig(
			this.buildConfigRoot(
				this.loadUsingMemoryProviderSync(noValuesTestConfig),
				this.loadThroughProviderSync(testConfig),
			),
		);
	}

	Combining_from_multiple_providers_is_case_insensitive(): void {
		this.assertConfig(
			this.buildConfigRoot(
				this.loadUsingMemoryProviderSync(differentCasedTestConfig),
				this.loadThroughProviderSync(testConfig),
			),
		);
	}

	// TODO
}

export function testConfigProvider(
	configProviderTest: ConfigProviderTestBase,
): void {
	test('Load_from_single_provider', () => {
		configProviderTest.Load_from_single_provider();
	});

	test('Has_debug_view', () => {
		configProviderTest.Has_debug_view();
	});

	test('Null_values_are_included_in_the_config', () => {
		configProviderTest.Null_values_are_included_in_the_config();
	});

	test('Combine_after_other_provider', () => {
		configProviderTest.Combine_after_other_provider();
	});

	test('Combine_before_other_provider', () => {
		configProviderTest.Combine_before_other_provider();
	});

	test('Second_provider_overrides_values_from_first', () => {
		configProviderTest.Second_provider_overrides_values_from_first();
	});

	test('Combining_from_multiple_providers_is_case_insensitive', () => {
		configProviderTest.Combining_from_multiple_providers_is_case_insensitive();
	});

	// TODO
}
