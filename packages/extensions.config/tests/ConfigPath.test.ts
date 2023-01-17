import {
	combineConfigPath,
	getParentPath,
	getSectionKey,
} from '@yohira/extensions.config.abstractions';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationPathTest.cs#L12
test('CombineWithEmptySegmentLeavesDelimiter', () => {
	expect(combineConfigPath('parent', '')).toBe('parent:');
	expect(combineConfigPath('parent', '', '')).toBe('parent::');
	expect(combineConfigPath('parent', '', '', 'key')).toBe('parent:::key');
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationPathTest.cs#L20
test('GetLastSegmentGetSectionKeyTests', () => {
	expect(getSectionKey(undefined)).toBeUndefined();
	expect(getSectionKey('')).toBe('');
	expect(getSectionKey(':::')).toBe('');
	expect(getSectionKey('a::b:::c')).toBe('c');
	expect(getSectionKey('a:::b:')).toBe('');
	expect(getSectionKey('key')).toBe('key');
	expect(getSectionKey(':key')).toBe('key');
	expect(getSectionKey('::key')).toBe('key');
	expect(getSectionKey('parent:key')).toBe('key');
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Configuration/tests/ConfigurationPathTest.cs#L34
test('GetParentPathTests', () => {
	expect(getParentPath(undefined)).toBeUndefined();
	expect(getParentPath('')).toBeUndefined();
	expect(getParentPath(':::')).toBe('::');
	expect(getParentPath('a::b:::c')).toBe('a::b::');
	expect(getParentPath('a:::b:')).toBe('a:::b');
	expect(getParentPath('key')).toBeUndefined();
	expect(getParentPath(':key')).toBe('');
	expect(getParentPath('::key')).toBe(':');
	expect(getParentPath('parent:key')).toBe('parent');
});
