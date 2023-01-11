import {
	asIterable,
	getConnectionString,
} from '@yohira/extensions.config.abstractions/ConfigExtensions';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IConfigProvider } from '@yohira/extensions.config.abstractions/IConfigProvider';
import { IConfigSource } from '@yohira/extensions.config.abstractions/IConfigSource';
import { addConfig } from '@yohira/extensions.config/ChainedBuilderExtensions';
import { ConfigBuilder } from '@yohira/extensions.config/ConfigBuilder';
import { addInMemoryCollection } from '@yohira/extensions.config/MemoryConfigBuilderExtensions';
import { MemoryConfigProvider } from '@yohira/extensions.config/MemoryConfigProvider';
import { MemoryConfigSource } from '@yohira/extensions.config/MemoryConfigSource';
import { expect, test } from 'vitest';

import { get } from './common/ConfigProviderExtensions';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L15
test('LoadAndCombineKeyValuePairsFromDifferentConfigurationProviders', () => {
	const dic1 = { 'Mem1:KeyInMem1': 'ValueInMem1' };
	const dic2 = { 'Mem2:keyInMem2': 'ValueInMem2' };
	const dic3 = { 'Mem3:keyInMem3': 'ValueInMem3' };
	const memConfigSrc1 = new MemoryConfigSource(dic1);
	const memConfigSrc2 = new MemoryConfigSource(dic2);
	const memConfigSrc3 = new MemoryConfigSource(dic3);

	const configBuilder = new ConfigBuilder();

	configBuilder.add(memConfigSrc1);
	configBuilder.add(memConfigSrc2);
	configBuilder.add(memConfigSrc3);

	const config = configBuilder.build();

	const memVal1 = config.get('mem1:keyinmem1');
	const memVal2 = config.get('Mem2:KeyInMem2');
	const memVal3 = config.get('MEM3:KEYINMEM3');

	expect(configBuilder.sources.contains(memConfigSrc1)).toBe(true);
	expect(configBuilder.sources.contains(memConfigSrc2)).toBe(true);
	expect(configBuilder.sources.contains(memConfigSrc3)).toBe(true);

	expect(memVal1).toBe('ValueInMem1');
	expect(memVal2).toBe('ValueInMem2');
	expect(memVal3).toBe('ValueInMem3');

	expect(config.get('mem1:keyinmem1')).toBe('ValueInMem1');
	expect(config.get('Mem2:KeyInMem2')).toBe('ValueInMem2');
	expect(config.get('MEM3:KEYINMEM3')).toBe('ValueInMem3');
	expect(config.get('NotExist')).toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L63
test('CanChainConfiguration', () => {
	const dic1 = { 'Mem1:KeyInMem1': 'ValueInMem1' };
	const dic2 = { 'Mem2:KeyInMem2': 'ValueInMem2' };
	const dic3 = { 'Mem3:KeyInMem3': 'ValueInMem3' };
	const memConfigSrc1 = new MemoryConfigSource(dic1);
	const memConfigSrc2 = new MemoryConfigSource(dic2);
	const memConfigSrc3 = new MemoryConfigSource(dic3);

	const configBuilder = new ConfigBuilder();

	configBuilder.add(memConfigSrc1);
	configBuilder.add(memConfigSrc2);
	configBuilder.add(memConfigSrc3);

	const config = configBuilder.build();

	const chained = addConfig(new ConfigBuilder(), config).build();
	const memVal1 = chained.get('mem1:keyinmem1');
	const memVal2 = chained.get('Mem2:KeyInMem2');
	const memVal3 = chained.get('MEM3:KEYINMEM3');

	expect(memVal1).toBe('ValueInMem1');
	expect(memVal2).toBe('ValueInMem2');
	expect(memVal3).toBe('ValueInMem3');

	expect(chained.get('NotExist')).toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L108
test('ChainedAsEnumerateFlattensIntoDictionaryTest', () => {
	const ChainedAsEnumerateFlattensIntoDictionaryTest = (
		removePath: boolean,
	): void => {
		const dic1 = {
			Mem1: 'Value1',
			'Mem1:': 'NoKeyValue1',
			'Mem1:KeyInMem1': 'ValueInMem1',
			'Mem1:KeyInMem1:Deep1': 'ValueDeep1',
		};
		const dic2 = {
			Mem2: 'Value2',
			'Mem2:': 'NoKeyValue2',
			'Mem2:KeyInMem2': 'ValueInMem2',
			'Mem2:KeyInMem2:Deep2': 'ValueDeep2',
		};
		const dic3 = {
			Mem3: 'Value3',
			'Mem3:': 'NoKeyValue3',
			'Mem3:KeyInMem3': 'ValueInMem3',
			'Mem3:KeyInMem3:Deep3': 'ValueDeep3',
		};
		const memConfigSrc1 = new MemoryConfigSource(dic1);
		const memConfigSrc2 = new MemoryConfigSource(dic2);
		const memConfigSrc3 = new MemoryConfigSource(dic3);

		const configBuilder = new ConfigBuilder();

		configBuilder.add(memConfigSrc1);
		configBuilder.add(memConfigSrc2);
		const config = addConfig(new ConfigBuilder(), configBuilder.build())
			.add(memConfigSrc3)
			.build();
		const dict = Object.fromEntries(asIterable(config, removePath));

		expect(dict['Mem1'.toLowerCase()]).toBe('Value1');
		expect(dict['Mem1:'.toLowerCase()]).toBe('NoKeyValue1');
		expect(dict['Mem1:KeyInMem1:Deep1'.toLowerCase()]).toBe('ValueDeep1');
		expect(dict['Mem2:KeyInMem2'.toLowerCase()]).toBe('ValueInMem2');
		expect(dict['Mem2'.toLowerCase()]).toBe('Value2');
		expect(dict['Mem2:'.toLowerCase()]).toBe('NoKeyValue2');
		expect(dict['Mem2:KeyInMem2:Deep2'.toLowerCase()]).toBe('ValueDeep2');
		expect(dict['Mem3'.toLowerCase()]).toBe('Value3');
		expect(dict['Mem3:'.toLowerCase()]).toBe('NoKeyValue3');
		expect(dict['Mem3:KeyInMem3'.toLowerCase()]).toBe('ValueInMem3');
		expect(dict['Mem3:KeyInMem3:Deep3'.toLowerCase()]).toBe('ValueDeep3');
	};

	ChainedAsEnumerateFlattensIntoDictionaryTest(true);
	ChainedAsEnumerateFlattensIntoDictionaryTest(false);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L164
test('AsEnumerateFlattensIntoDictionaryTest', () => {
	const AsEnumerateFlattensIntoDictionaryTest = (
		removePath: boolean,
	): void => {
		const dic1 = {
			Mem1: 'Value1',
			'Mem1:': 'NoKeyValue1',
			'Mem1:KeyInMem1': 'ValueInMem1',
			'Mem1:KeyInMem1:Deep1': 'ValueDeep1',
		};
		const dic2 = {
			Mem2: 'Value2',
			'Mem2:': 'NoKeyValue2',
			'Mem2:KeyInMem2': 'ValueInMem2',
			'Mem2:KeyInMem2:Deep2': 'ValueDeep2',
		};
		const dic3 = {
			Mem3: 'Value3',
			'Mem3:': 'NoKeyValue3',
			'Mem3:KeyInMem3': 'ValueInMem3',
			'Mem3:KeyInMem3:Deep3': 'ValueDeep3',
		};
		const memConfigSrc1 = new MemoryConfigSource(dic1);
		const memConfigSrc2 = new MemoryConfigSource(dic2);
		const memConfigSrc3 = new MemoryConfigSource(dic3);

		const configBuilder = new ConfigBuilder();

		configBuilder.add(memConfigSrc1);
		configBuilder.add(memConfigSrc2);
		configBuilder.add(memConfigSrc3);
		const config = configBuilder.build();
		const dict = Object.fromEntries(asIterable(config, removePath));

		expect(dict['Mem1'.toLowerCase()]).toBe('Value1');
		expect(dict['Mem1:'.toLowerCase()]).toBe('NoKeyValue1');
		expect(dict['Mem1:KeyInMem1:Deep1'.toLowerCase()]).toBe('ValueDeep1');
		expect(dict['Mem2:KeyInMem2'.toLowerCase()]).toBe('ValueInMem2');
		expect(dict['Mem2'.toLowerCase()]).toBe('Value2');
		expect(dict['Mem2:'.toLowerCase()]).toBe('NoKeyValue2');
		expect(dict['Mem2:KeyInMem2:Deep2'.toLowerCase()]).toBe('ValueDeep2');
		expect(dict['Mem3'.toLowerCase()]).toBe('Value3');
		expect(dict['Mem3:'.toLowerCase()]).toBe('NoKeyValue3');
		expect(dict['Mem3:KeyInMem3'.toLowerCase()]).toBe('ValueInMem3');
		expect(dict['Mem3:KeyInMem3:Deep3'.toLowerCase()]).toBe('ValueDeep3');
	};

	AsEnumerateFlattensIntoDictionaryTest(true);
	AsEnumerateFlattensIntoDictionaryTest(false);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L216
/* TODO: test('AsEnumerateStripsKeyFromChildren', () => {
	const dic1 = {
		Mem1: 'Value1',
		'Mem1:': 'NoKeyValue1',
		'Mem1:KeyInMem1': 'ValueInMem1',
		'Mem1:KeyInMem1:Deep1': 'ValueDeep1',
	};
	const dic2 = {
		Mem2: 'Value2',
		'Mem2:': 'NoKeyValue2',
		'Mem2:KeyInMem2': 'ValueInMem2',
		'Mem2:KeyInMem2:Deep2': 'ValueDeep2',
	};
	const dic3 = {
		Mem3: 'Value3',
		'Mem3:': 'NoKeyValue3',
		'Mem3:KeyInMem3': 'ValueInMem3',
		'Mem3:KeyInMem4': 'ValueInMem4',
		'Mem3:KeyInMem3:Deep3': 'ValueDeep3',
		'Mem3:KeyInMem3:Deep4': 'ValueDeep4',
	};
	const memConfigSrc1 = new MemoryConfigSource(dic1);
	const memConfigSrc2 = new MemoryConfigSource(dic2);
	const memConfigSrc3 = new MemoryConfigSource(dic3);

	const configBuilder = new ConfigBuilder();

	configBuilder.add(memConfigSrc1);
	configBuilder.add(memConfigSrc2);
	configBuilder.add(memConfigSrc3);

	const config = configBuilder.build();

	const dict = Object.fromEntries(
		asIterable(config.getSection('Mem1'), true),
	);
	expect(Object.entries(dict).length).toBe(3);
	expect(dict[''.toLowerCase()]).toBe('NoKeyValue1');
	expect(dict['KeyInMem1'.toLowerCase()]).toBe('ValueInMem1');
	expect(dict['KeyInMem1:Deep1'.toLowerCase()]).toBe('ValueDeep1');

	const dict2 = Object.fromEntries(
		asIterable(config.getSection('Mem2'), true),
	);
	expect(Object.entries(dict2).length).toBe(3);
	expect(dict2[''.toLowerCase()]).toBe('NoKeyValue2');
	expect(dict2['KeyInMem2'.toLowerCase()]).toBe('ValueInMem2');
	expect(dict2['KeyInMem2:Deep2'.toLowerCase()]).toBe('ValueDeep2');

	const dict3 = Object.fromEntries(
		asIterable(config.getSection('Mem3'), true),
	);
	expect(Object.entries(dict3).length).toBe(5);
	expect(dict3[''.toLowerCase()]).toBe('NoKeyValue3');
	expect(dict3['KeyInMem3'.toLowerCase()]).toBe('ValueInMem3');
	expect(dict3['KeyInMem4'.toLowerCase()]).toBe('ValueInMem4');
	expect(dict3['KeyInMem3:Deep3'.toLowerCase()]).toBe('ValueDeep3');
	expect(dict3['KeyInMem3:Deep4'.toLowerCase()]).toBe('ValueDeep4');
}); */

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L278
test('NewConfigurationProviderOverridesOldOneWhenKeyIsDuplicated', () => {
	const dic1 = { 'Key1:Key2': 'ValueInMem1' };
	const dic2 = { 'Key1:Key2': 'ValueInMem2' };
	const memConfigSrc1 = new MemoryConfigSource(dic1);
	const memConfigSrc2 = new MemoryConfigSource(dic2);

	const configBuilder = new ConfigBuilder();

	configBuilder.add(memConfigSrc1);
	configBuilder.add(memConfigSrc2);

	const config = configBuilder.build();

	expect(config.get('Key1:Key2')).toBe('ValueInMem2');
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L305
test('NewConfigurationRootMayBeBuiltFromExistingWithDuplicateKeys', () => {
	let $: ConfigBuilder;
	$ = new ConfigBuilder();
	$ = addInMemoryCollection($, { 'keya:keyb': 'valueA' });
	$ = addInMemoryCollection($, { 'KEYA:KEYB': 'valueB' });
	const configRoot = $.build();
	const newConfigRoot = addInMemoryCollection(
		new ConfigBuilder(),
		Object.fromEntries(asIterable(configRoot)),
	).build();
	expect(newConfigRoot.get('keya:keyb')).toBe('valueB');
});

class TestMemorySourceProvider
	extends MemoryConfigProvider
	implements IConfigSource
{
	constructor(initialData: Record<string, string>) {
		super(new MemoryConfigSource(initialData));
	}

	build = (builder: IConfigBuilder): IConfigProvider => {
		return this;
	};
}

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L336
test('SettingValueUpdatesAllConfigurationProviders', () => {
	const dict = {
		Key1: 'Value1',
		Key2: 'Value2',
	};

	const memConfigSrc1 = new TestMemorySourceProvider(dict);
	const memConfigSrc2 = new TestMemorySourceProvider(dict);
	const memConfigSrc3 = new TestMemorySourceProvider(dict);

	const configBuilder = new ConfigBuilder();

	configBuilder.add(memConfigSrc1);
	configBuilder.add(memConfigSrc2);
	configBuilder.add(memConfigSrc3);

	const config = configBuilder.build();

	config.set('Key1', 'NewValue1');
	config.set('Key2', 'NewValue2');

	const memConfigProvider1 = memConfigSrc1.build(configBuilder);
	const memConfigProvider2 = memConfigSrc2.build(configBuilder);
	const memConfigProvider3 = memConfigSrc3.build(configBuilder);

	expect(config.get('Key1')).toBe('NewValue1');
	expect(get(memConfigProvider1, 'Key1')).toBe('NewValue1');
	expect(get(memConfigProvider2, 'Key1')).toBe('NewValue1');
	expect(get(memConfigProvider3, 'Key1')).toBe('NewValue1');
	expect(config.get('Key2')).toBe('NewValue2');
	expect(get(memConfigProvider1, 'Key2')).toBe('NewValue2');
	expect(get(memConfigProvider2, 'Key2')).toBe('NewValue2');
	expect(get(memConfigProvider3, 'Key2')).toBe('NewValue2');
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L377
test('CanGetConfigurationSection', () => {
	const dic1 = {
		'Data:DB1:Connection1': 'MemVal1',
		'Data:DB1:Connection2': 'MemVal2',
	};
	const dic2 = {
		'DataSource:DB2:Connection': 'MemVal3',
	};
	const dic3 = {
		Data: 'MemVal4',
	};
	const memConfigSrc1 = new MemoryConfigSource(dic1);
	const memConfigSrc2 = new MemoryConfigSource(dic2);
	const memConfigSrc3 = new MemoryConfigSource(dic3);

	const configBuilder = new ConfigBuilder();
	configBuilder.add(memConfigSrc1);
	configBuilder.add(memConfigSrc2);
	configBuilder.add(memConfigSrc3);

	const config = configBuilder.build();

	const configFocus = config.getSection('Data');

	const memVal1 = configFocus.get('DB1:Connection1');
	const memVal2 = configFocus.get('DB1:Connection2');
	const memVal3 = configFocus.get('DB2:Connection');
	const memVal4 = configFocus.get('Source:DB2:Connection');
	const memVal5 = configFocus.value;

	expect(memVal1).toBe('MemVal1');
	expect(memVal2).toBe('MemVal2');
	expect(memVal5).toBe('MemVal4');

	expect(configFocus.get('DB1:Connection1')).toBe('MemVal1');
	expect(configFocus.get('DB1:Connection2')).toBe('MemVal2');
	expect(configFocus.get('DB2:Connection')).toBeUndefined();
	expect(configFocus.get('Source:DB2:Connection')).toBeUndefined();
	expect(configFocus.value).toBe('MemVal4');
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationTest.cs#L426
test('CanGetConnectionStrings', () => {
	const dic1 = {
		'ConnectionStrings:DB1:Connection1': 'MemVal1',
		'ConnectionStrings:DB1:Connection2': 'MemVal2',
	};
	const dic2 = {
		'ConnectionStrings:DB2:Connection': 'MemVal3',
	};
	const memConfigSrc1 = new MemoryConfigSource(dic1);
	const memConfigSrc2 = new MemoryConfigSource(dic2);

	const configBuilder = new ConfigBuilder();
	configBuilder.add(memConfigSrc1);
	configBuilder.add(memConfigSrc2);

	const config = configBuilder.build();

	const memVal1 = getConnectionString(config, 'DB1:Connection1');
	const memVal2 = getConnectionString(config, 'DB1:Connection2');
	const memVal3 = getConnectionString(config, 'DB2:Connection');

	expect(memVal1).toBe('MemVal1');
	expect(memVal2).toBe('MemVal2');
	expect(memVal3).toBe('MemVal3');
});

// TODO
