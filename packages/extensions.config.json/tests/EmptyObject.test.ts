import {
	JsonConfigProvider,
	JsonConfigSource,
} from '@yohira/extensions.config.json';
import { Readable } from 'node:stream';
import { expect, test } from 'vitest';

import { get } from '../../extensions.config/tests/common/ConfigProviderExtensions';

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/EmptyObjectTest.cs#L12
test('EmptyObject_AddsAsNull', () => {
	const json = `{
	"key": { },
}`;

	const jsonConfigSource = new JsonConfigProvider(new JsonConfigSource());
	jsonConfigSource.loadStream(Readable.from(json));

	expect(get(jsonConfigSource, 'key')).toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/EmptyObjectTest.cs#L25
test('NullObject_AddsEmptyString', () => {
	const json = `{
	"key": null,
}`;

	const jsonConfigSource = new JsonConfigProvider(new JsonConfigSource());
	jsonConfigSource.loadStream(Readable.from(json));

	expect(get(jsonConfigSource, 'key')).toBe('');
});

// https://github.com/dotnet/runtime/blob/67743295d05777ce3701135afbbdb473d4fb4436/src/libraries/Microsoft.Extensions.Configuration.Json/tests/EmptyObjectTest.cs#L38
test('NestedObject_DoesNotAddParent', () => {
	const json = `{
	"key": {
		"nested": "value"
	},
}`;

	const jsonConfigSource = new JsonConfigProvider(new JsonConfigSource());
	jsonConfigSource.loadStream(Readable.from(json));

	const tryGetResult = jsonConfigSource.tryGet('key');
	expect(tryGetResult.ok).toBe(false);
	expect(get(jsonConfigSource, 'key:nested')).toBe('value');
});
