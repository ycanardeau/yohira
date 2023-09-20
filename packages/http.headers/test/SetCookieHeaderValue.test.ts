import { StringBuilder, TimeSpan } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';
import { SameSiteMode, SetCookieHeaderValue } from '@yohira/http.headers';
import { expect, test } from 'vitest';

const setCookieHeaderDataSet = ((): readonly (readonly [
	SetCookieHeaderValue,
	string,
])[] => {
	const dataset: [SetCookieHeaderValue, string][] = [];
	const header1 = new SetCookieHeaderValue(
		StringSegment.from('name1'),
		StringSegment.from('n1=v1&n2=v2&n3=v3'),
	);
	header1.domain = StringSegment.from('domain1');
	header1.expires = Date.UTC(1994, 11 - 1, 6, 8, 49, 37);
	header1.sameSite = SameSiteMode.Strict;
	header1.httpOnly = true;
	header1.maxAge = TimeSpan.fromDays(1);
	header1.path = StringSegment.from('path1');
	header1.secure = true;
	header1.extensions.push(StringSegment.from('extension1'));
	header1.extensions.push(StringSegment.from('extension2=value'));
	dataset.push([
		header1,
		'name1=n1=v1&n2=v2&n3=v3; expires=Sun, 06 Nov 1994 08:49:37 GMT; max-age=86400; domain=domain1; path=path1; secure; samesite=strict; httponly; extension1; extension2=value',
	]);

	const header2 = new SetCookieHeaderValue(
		StringSegment.from('name2'),
		StringSegment.from(''),
	);
	dataset.push([header2, 'name2=']);

	const header3 = new SetCookieHeaderValue(
		StringSegment.from('name2'),
		StringSegment.from('value2'),
	);
	dataset.push([header3, 'name2=value2']);

	const header4 = new SetCookieHeaderValue(
		StringSegment.from('name4'),
		StringSegment.from('value4'),
	);
	header4.maxAge = TimeSpan.fromDays(1);
	dataset.push([header4, 'name4=value4; max-age=86400']);

	const header5 = new SetCookieHeaderValue(
		StringSegment.from('name5'),
		StringSegment.from('value5'),
	);
	header5.domain = StringSegment.from('domain1');
	header5.expires = Date.UTC(1994, 11 - 1, 6, 8, 49, 37);
	dataset.push([
		header5,
		'name5=value5; expires=Sun, 06 Nov 1994 08:49:37 GMT; domain=domain1',
	]);

	const header6 = new SetCookieHeaderValue(
		StringSegment.from('name6'),
		StringSegment.from('value6'),
	);
	header6.sameSite = SameSiteMode.Lax;
	dataset.push([header6, 'name6=value6; samesite=lax']);

	const header7 = new SetCookieHeaderValue(
		StringSegment.from('name7'),
		StringSegment.from('value7'),
	);
	header7.sameSite = SameSiteMode.None;
	dataset.push([header7, 'name7=value7; samesite=none']);

	const header8 = new SetCookieHeaderValue(
		StringSegment.from('name8'),
		StringSegment.from('value8'),
	);
	header8.extensions.push(StringSegment.from('extension1'));
	header8.extensions.push(StringSegment.from('extension2=value'));
	dataset.push([header8, 'name8=value8; extension1; extension2=value']);

	const header9 = new SetCookieHeaderValue(
		StringSegment.from('name9'),
		StringSegment.from('value9'),
	);
	header9.maxAge = TimeSpan.fromDays(-1);
	dataset.push([header9, 'name9=value9; max-age=-86400']);

	const header10 = new SetCookieHeaderValue(
		StringSegment.from('name10'),
		StringSegment.from('value10'),
	);
	header10.maxAge = TimeSpan.fromDays(0);
	dataset.push([header10, 'name10=value10; max-age=0']);

	return dataset;
})();

const invalidCookieNames = [
	'<acb>',
	'{acb}',
	'[acb]',
	'"acb"',
	'a,b',
	'a;b',
	'a\\b',
] as const;

const invalidCookieValues = [
	'"',
	'a,b',
	'a;b',
	'a\\b',
	'"abc',
	'a"bc',
	'abc"',
] as const;

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L298
test('SetCookieHeaderValue_CtorThrowsOnNullName', () => {
	expect(
		() =>
			new SetCookieHeaderValue(
				StringSegment.from(undefined),
				StringSegment.from('value'),
			),
	).toThrowError('Value cannot be undefined.');
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L305
test('SetCookieHeaderValue_CtorThrowsOnInvalidName', () => {
	function SetCookieHeaderValue_CtorThrowsOnInvalidName(name: string): void {
		expect(
			() =>
				new SetCookieHeaderValue(
					StringSegment.from(name),
					StringSegment.from('value'),
				),
		).toThrowError(`Invalid cookie name: ${name}`);
	}

	for (const invalidCookieName of invalidCookieNames) {
		SetCookieHeaderValue_CtorThrowsOnInvalidName(invalidCookieName);
	}
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L312
test('SetCookieHeaderValue_CtorThrowsOnInvalidValue', () => {
	function SetCookieHeaderValue_CtorThrowsOnInvalidValue(
		value: string,
	): void {
		expect(
			() =>
				new SetCookieHeaderValue(
					StringSegment.from('name'),
					StringSegment.from(value),
				),
		).toThrowError(`Invalid cookie value: ${value}`);
	}

	for (const invalidCookieValue of invalidCookieValues) {
		SetCookieHeaderValue_CtorThrowsOnInvalidValue(invalidCookieValue);
	}
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L318
test('SetCookieHeaderValue_Ctor1_InitializesCorrectly', () => {
	const header = new SetCookieHeaderValue(StringSegment.from('cookie'));
	expect(header.name.toString()).toBe('cookie');
	expect(header.value.toString()).toBe('');
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L329
test('SetCookieHeaderValue_Ctor2InitializesCorrectly', () => {
	function SetCookieHeaderValue_Ctor2InitializesCorrectly(
		name: string,
		value: string,
	): void {
		const header = new SetCookieHeaderValue(
			StringSegment.from(name),
			StringSegment.from(value),
		);
		expect(header.name.toString()).toBe(name);
		expect(header.value.toString()).toBe(value);
	}

	SetCookieHeaderValue_Ctor2InitializesCorrectly('name', '');
	SetCookieHeaderValue_Ctor2InitializesCorrectly('name', 'value');
	SetCookieHeaderValue_Ctor2InitializesCorrectly('name', '"acb"');
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L337
test('SetCookieHeaderValue_Value', () => {
	const cookie = new SetCookieHeaderValue(StringSegment.from('name'));
	expect(cookie.value.toString()).toBe('');

	cookie.value = StringSegment.from('value1');
	expect(cookie.value.toString()).toBe('value1');
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L348
test('SetCookieHeaderValue_ToString', () => {
	function SetCookieHeaderValue_ToString(
		input: SetCookieHeaderValue,
		expectedValue: string,
	): void {
		expect(input.toString()).toBe(expectedValue);
	}

	for (const [input, expectedValue] of setCookieHeaderDataSet) {
		SetCookieHeaderValue_ToString(input, expectedValue);
	}
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L355
test('SetCookieHeaderValue_AppendToStringBuilder', () => {
	function SetCookieHeaderValue_AppendToStringBuilder(
		input: SetCookieHeaderValue,
		expectedValue: string,
	): void {
		const builder = new StringBuilder();

		input.appendToStringBuilder(builder);

		expect(builder.toString()).toBe(expectedValue);
	}

	for (const [input, expectedValue] of setCookieHeaderDataSet) {
		SetCookieHeaderValue_AppendToStringBuilder(input, expectedValue);
	}
});

// https://github.com/dotnet/aspnetcore/blob/ee6d623741948c6ca907f60bad06736229b7d5e3/src/Http/Headers/test/SetCookieHeaderValueTest.cs#L366
/* TODO: test('SetCookieHeaderValue_Parse_AcceptsValidValues', () => {
	function SetCookieHeaderValue_Parse_AcceptsValidValues(
		cookie: SetCookieHeaderValue,
		expectedValue: string,
	): void {
		const header = SetCookieHeaderValue.parse(expectedValue);

		expect(header.equals(cookie)).toBe(true);
		expect(header.toString()).toBe(expectedValue);
	}

	for (const [cookie, expectedValue] of setCookieHeaderDataSet) {
		SetCookieHeaderValue_Parse_AcceptsValidValues(cookie, expectedValue);
	}
}); */

// TODO
