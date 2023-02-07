import { ConfigBuilder } from '@yohira/extensions.config';
import {
	JsonConfigProvider,
	JsonConfigSource,
	addJsonFile,
	addJsonStream,
} from '@yohira/extensions.config.json';
import { Readable } from 'node:stream';
import { expect, test } from 'vitest';

import { get } from '../../extensions.config/tests/common/ConfigProviderExtensions';

function loadProviderSync(json: string): JsonConfigProvider {
	const source = new JsonConfigSource();
	source.optional = true;
	const provider = new JsonConfigProvider(source);
	provider.loadStreamSync(Readable.from(json));
	return provider;
}

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L23
test('CanLoadValidJsonFromStreamProvider', () => {
	const json = `
{
    "firstname": "test",
    "test.last.name": "last.name",
        "residential.address": {
            "street.name": "Something street",
            "zipcode": "12345"
        }
}`;
	const config = addJsonStream(
		new ConfigBuilder(),
		Readable.from(json),
	).buildSync();
	expect(config.get('firstname')).toBe('test');
	expect(config.get('test.last.name')).toBe('last.name');
	expect(config.get('residential.address:STREET.name')).toBe(
		'Something street',
	);
	expect(config.get('residential.address:zipcode')).toBe('12345');
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L42
test('ReloadThrowsFromStreamProvider', () => {
	const json = `
{
    "firstname": "test"
}`;
	const config = addJsonStream(
		new ConfigBuilder(),
		Readable.from(json),
	).buildSync();
	expect(() => config.reloadSync()).toThrowError();
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L54
test('LoadKeyValuePairsFromValidJson', () => {
	const json = `
{
    "firstname": "test",
    "test.last.name": "last.name",
        "residential.address": {
            "street.name": "Something street",
            "zipcode": "12345"
        }
}`;
	const jsonConfigSrc = loadProviderSync(json);

	expect(get(jsonConfigSrc, 'firstname')).toBe('test');
	expect(get(jsonConfigSrc, 'test.last.name')).toBe('last.name');
	expect(get(jsonConfigSrc, 'residential.address:STREET.name')).toBe(
		'Something street',
	);
	expect(get(jsonConfigSrc, 'residential.address:zipcode')).toBe('12345');
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L74
test('LoadMethodCanHandleEmptyValue', () => {
	const json = `
{
    "name": ""
}`;
	const jsonConfigSrc = loadProviderSync(json);
	expect(get(jsonConfigSrc, 'name')).toBe('');
});

// TODO

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L107
test('NonObjectRootIsInvalid', () => {
	const json = `"test"`;

	expect(() => loadProviderSync(json)).toThrowError();
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L118
test('SupportAndIgnoreComments', () => {
	const json = `/* Comments */
	{/* Comments */
	"name": /* Comments */ "test",
	"address": {
		"street": "Something street", /* Comments */
		"zipcode": "12345"
	}
}`;
	/* FIXME: const jsonConfigSrc = loadProviderSync(json);
	expect(get(jsonConfigSrc, 'name')).toBe('test');
	expect(get(jsonConfigSrc, 'address:street')).toBe('Something street');
	expect(get(jsonConfigSrc, 'address:zipcode')).toBe('12345'); */
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L135
test('SupportAndIgnoreTrailingCommas', () => {
	const json = `
{
    "firstname": "test",
    "test.last.name": "last.name",
        "residential.address": {
            "street.name": "Something street",
            "zipcode": "12345",
        },
}`;
	/* FIXME: const jsonConfigSrc = loadProviderSync(json);

	expect(get(jsonConfigSrc, 'firstname')).toBe('test');
	expect(get(jsonConfigSrc, 'test.last.name')).toBe('last.name');
	expect(get(jsonConfigSrc, 'residential.address:STREET.name')).toBe(
		'Something street',
	);
	expect(get(jsonConfigSrc, 'residential.address:zipcode')).toBe('12345'); */
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L155
test('ThrowExceptionWhenUnexpectedEndFoundBeforeFinishParsing', () => {
	const json = `{
	""name"": ""test"",
	""address"": {
		""street"": ""Something street"",
		""zipcode"": ""12345""
	}
/* Missing a right brace here*/`;
	expect(() => loadProviderSync(json)).toThrowError(
		'Could not parse the JSON file.',
	);
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L169
test('ThrowExceptionWhenMissingCurlyBeforeFinishParsing', () => {
	const json = `
{
	"Data": {`;

	expect(() => loadProviderSync(json)).toThrowError(
		'Could not parse the JSON file.',
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L191
test('ThrowExceptionWhenPassingEmptyStringAsFilePath', () => {
	expect(() =>
		addJsonFile(new ConfigBuilder(), undefined, '', false, false),
	).toThrowError('File path must be a non-empty string.');
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L201
test('JsonConfiguration_Throws_On_Missing_Configuration_File', () => {
	const config = addJsonFile(
		new ConfigBuilder(),
		undefined,
		'NotExistingConfig.json',
		false,
		false,
	);

	expect(() => config.buildSync()).toThrowError(
		`The configuration file 'NotExistingConfig.json' was not found and is not optional. The expected physical path was '`,
	);
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L211
test('JsonConfiguration_Does_Not_Throw_On_Optional_Configuration', () => {
	const config = addJsonFile(
		new ConfigBuilder(),
		undefined,
		'NotExistingConfig.json',
		true,
		false,
	).buildSync();
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L217
test('ThrowFormatExceptionWhenFileIsEmpty', () => {
	expect(() => loadProviderSync(``)).toThrowError(
		'Could not parse the JSON file.',
	);
});
