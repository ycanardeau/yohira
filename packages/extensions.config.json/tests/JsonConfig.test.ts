import { addJsonStream } from '@yohira/extensions.config.json/JsonConfigExtensions';
import { JsonConfigProvider } from '@yohira/extensions.config.json/JsonConfigProvider';
import { JsonConfigSource } from '@yohira/extensions.config.json/JsonConfigSource';
import { ConfigBuilder } from '@yohira/extensions.config/ConfigBuilder';
import { Readable } from 'node:stream';
import { expect, test } from 'vitest';

import { get } from '../../extensions.config/tests/common/ConfigProviderExtensions';

function loadProvider(json: string): JsonConfigProvider {
	const source = new JsonConfigSource();
	source.optional = true;
	const provider = new JsonConfigProvider(source);
	provider.loadStream(Readable.from(json));
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
	).build();
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
	).build();
	expect(() => config.reload()).toThrowError();
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
	const jsonConfigSrc = loadProvider(json);

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
	const jsonConfigSrc = loadProvider(json);
	expect(get(jsonConfigSrc, 'name')).toBe('');
});

// TODO

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/JsonConfigurationTest.cs#L107
test('NonObjectRootIsInvalid', () => {
	const json = `"test"`;

	expect(() => loadProvider(json)).toThrowError();
});

// TODO
