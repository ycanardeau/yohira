import { TimeSpan } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';
import {
	CacheControlHeaderValue,
	NameValueHeaderValue,
} from '@yohira/http.headers';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L9C17-L9C75
test('Properties_SetAndGetAllProperties_SetValueReturnedInGetter', () => {
	const cacheControl = new CacheControlHeaderValue();

	// Bool properties
	cacheControl.noCache = true;
	expect(cacheControl.noCache).toBe(true);
	cacheControl.noStore = true;
	expect(cacheControl.noStore).toBe(true);
	cacheControl.maxStale = true;
	expect(cacheControl.maxStale).toBe(true);
	cacheControl.noTransform = true;
	expect(cacheControl.noTransform).toBe(true);
	cacheControl.onlyIfCached = true;
	expect(cacheControl.onlyIfCached).toBe(true);
	cacheControl.public = true;
	expect(cacheControl.public).toBe(true);
	cacheControl.private = true;
	expect(cacheControl.private).toBe(true);
	cacheControl.mustRevalidate = true;
	expect(cacheControl.mustRevalidate).toBe(true);
	cacheControl.proxyRevalidate = true;
	expect(cacheControl.proxyRevalidate).toBe(true);

	// TimeSpan properties
	const timeSpan = TimeSpan.fromSeconds(1 * 60 * 60 + 2 * 60 + 3);
	cacheControl.maxAge = timeSpan;
	expect(cacheControl.maxAge).toBe(timeSpan);
	cacheControl.sharedMaxAge = timeSpan;
	expect(cacheControl.sharedMaxAge).toBe(timeSpan);
	cacheControl.maxStaleLimit = timeSpan;
	expect(cacheControl.maxStaleLimit).toBe(timeSpan);
	cacheControl.minFresh = timeSpan;
	expect(cacheControl.minFresh).toBe(timeSpan);

	// String collection properties
	expect(cacheControl.noCacheHeaders).not.toBeUndefined();
	/* TODO: expect(() =>
		cacheControl.noCacheHeaders.push(StringSegment.from(undefined)),
	).toThrowError(''); */
	/* TODO: expect(() =>
		cacheControl.noCacheHeaders.push(
			StringSegment.from('invalid PLACEHOLDER'),
		),
	).toThrowError(''); */
	cacheControl.noCacheHeaders.push(StringSegment.from('PLACEHOLDER'));
	expect(cacheControl.noCacheHeaders.length).toBe(1);
	expect(
		cacheControl.noCacheHeaders[0].equals(
			StringSegment.from('PLACEHOLDER'),
		),
	).toBe(true);

	expect(cacheControl.privateHeaders).not.toBeUndefined();
	/* TODO: expect(() =>
		cacheControl.privateHeaders.push(StringSegment.from(undefined)),
	).toThrowError(); */
	/* TODO: expect(() =>
		cacheControl.privateHeaders.push(
			StringSegment.from('invalid PLACEHOLDER'),
		),
	); */
	cacheControl.privateHeaders.push(StringSegment.from('PLACEHOLDER'));
	expect(cacheControl.privateHeaders.length).toBe(1);
	expect(
		cacheControl.privateHeaders[0].equals(
			StringSegment.from('PLACEHOLDER'),
		),
	).toBe(true);

	// NameValueHeaderValue collection property
	expect(cacheControl.extensions).not.toBeUndefined();
	// TODO: expect(() => cacheControl.extensions.push(undefined!)).toThrowError();
	cacheControl.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('name'),
			StringSegment.from('value'),
		),
	);
	expect(cacheControl.extensions.length).toBe(1);
	expect(
		cacheControl.extensions[0].equals(
			new NameValueHeaderValue(
				StringSegment.from('name'),
				StringSegment.from('value'),
			),
		),
	).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L68
test('ToString_UseRequestDirectiveValues_AllSerializedCorrectly', () => {
	let cacheControl = new CacheControlHeaderValue();
	expect(cacheControl.toString()).toBe('');

	// Note that we allow all combinations of all properties even though the RFC specifies rules what value
	// can be used together.
	// Also for property pairs (bool property + collection property) like 'NoCache' and 'NoCacheHeaders' the
	// caller needs to set the bool property in order for the collection to be populated as string.

	// Cache Request Directive sample
	cacheControl.noStore = true;
	expect(cacheControl.toString()).toBe('no-store');
	cacheControl.noCache = true;
	expect(cacheControl.toString()).toBe('no-store, no-cache');
	cacheControl.maxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 10);
	expect(cacheControl.toString()).toBe('no-store, no-cache, max-age=70');
	cacheControl.maxStale = true;
	expect(cacheControl.toString()).toBe(
		'no-store, no-cache, max-age=70, max-stale',
	);
	cacheControl.maxStaleLimit = TimeSpan.fromSeconds(0 * 60 * 60 + 2 * 60 + 5);
	expect(cacheControl.toString()).toBe(
		'no-store, no-cache, max-age=70, max-stale=125',
	);
	cacheControl.minFresh = TimeSpan.fromSeconds(0 * 60 * 60 + 3 * 60 + 0);
	expect(cacheControl.toString()).toBe(
		'no-store, no-cache, max-age=70, max-stale=125, min-fresh=180',
	);

	cacheControl = new CacheControlHeaderValue();
	cacheControl.noTransform = true;
	expect(cacheControl.toString()).toBe('no-transform');
	cacheControl.onlyIfCached = true;
	expect(cacheControl.toString()).toBe('no-transform, only-if-cached');
	cacheControl.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	cacheControl.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('customName'),
			StringSegment.from('customValue'),
		),
	);
	expect(cacheControl.toString()).toBe(
		'no-transform, only-if-cached, custom, customName=customValue',
	);

	cacheControl = new CacheControlHeaderValue();
	cacheControl.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	expect(cacheControl.toString()).toBe('custom');
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L107C17-L107C75
test('ToString_UseResponseDirectiveValues_AllSerializedCorrectly', () => {
	let cacheControl = new CacheControlHeaderValue();
	expect(cacheControl.toString()).toBe('');

	cacheControl.noCache = true;
	expect(cacheControl.toString()).toBe('no-cache');
	cacheControl.noCacheHeaders.push(StringSegment.from('PLACEHOLDER1'));
	expect(cacheControl.toString()).toBe('no-cache="PLACEHOLDER1"');
	cacheControl.public = true;
	expect(cacheControl.toString()).toBe('public, no-cache="PLACEHOLDER1"');

	cacheControl = new CacheControlHeaderValue();
	cacheControl.private = true;
	expect(cacheControl.toString()).toBe('private');
	cacheControl.privateHeaders.push(StringSegment.from('PLACEHOLDER2'));
	cacheControl.privateHeaders.push(StringSegment.from('PLACEHOLDER3'));
	expect(cacheControl.toString()).toBe(
		'private="PLACEHOLDER2, PLACEHOLDER3"',
	);
	cacheControl.mustRevalidate = true;
	expect(cacheControl.toString()).toBe(
		'must-revalidate, private="PLACEHOLDER2, PLACEHOLDER3"',
	);
	cacheControl.proxyRevalidate = true;
	expect(cacheControl.toString()).toBe(
		'must-revalidate, proxy-revalidate, private="PLACEHOLDER2, PLACEHOLDER3"',
	);
});

function compareHashCodes(
	x: CacheControlHeaderValue,
	y: CacheControlHeaderValue,
	areEqual: boolean,
): void {
	if (areEqual) {
		expect(y.getHashCode()).toBe(x.getHashCode());
	} else {
		expect(y.getHashCode()).not.toBe(x.getHashCode());
	}
}

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L132C17-L132C76
test('GetHashCode_CompareValuesWithBoolFieldsSet_MatchExpectation', () => {
	// Verify that different bool fields return different hash values.
	const values: CacheControlHeaderValue[] = new Array(9);

	for (let i = 0; i < values.length; i++) {
		values[i] = new CacheControlHeaderValue();
	}

	values[0].proxyRevalidate = true;
	values[1].noCache = true;
	values[2].noStore = true;
	values[3].maxStale = true;
	values[4].noTransform = true;
	values[5].onlyIfCached = true;
	values[6].public = true;
	values[7].private = true;
	values[8].mustRevalidate = true;

	// Only one bool field set. All hash codes should differ
	for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < values.length; j++) {
			if (i !== j) {
				compareHashCodes(values[i], values[j], false);
			}
		}
	}

	// Validate that two instances with the same bool fields set are equal.
	values[0].noCache = true;
	compareHashCodes(values[0], values[1], false);
	values[1].proxyRevalidate = true;
	compareHashCodes(values[0], values[1], true);
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L172C17-L172C80
test('GetHashCode_CompareValuesWithTimeSpanFieldsSet_MatchExpectation', () => {
	// Verify that different timespan fields return different hash values.
	const values: CacheControlHeaderValue[] = new Array(4);

	for (let i = 0; i < values.length; i++) {
		values[i] = new CacheControlHeaderValue();
	}

	values[0].maxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[1].maxStaleLimit = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[2].minFresh = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[3].sharedMaxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);

	// Only one timespan field set. All hash codes should differ
	for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < values.length; j++) {
			if (i !== j) {
				compareHashCodes(values[i], values[j], false);
			}
		}
	}

	values[0].maxStaleLimit = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 2);
	compareHashCodes(values[0], values[1], false);

	values[1].maxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[1].maxStaleLimit = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 2);
	compareHashCodes(values[0], values[1], true);
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L208C17-L208C72
test('GetHashCode_CompareCollectionFieldsSet_MatchExpectation', () => {
	const cacheControl1 = new CacheControlHeaderValue();
	const cacheControl2 = new CacheControlHeaderValue();
	const cacheControl3 = new CacheControlHeaderValue();
	const cacheControl4 = new CacheControlHeaderValue();
	const cacheControl5 = new CacheControlHeaderValue();

	cacheControl1.noCache = true;
	cacheControl1.noCacheHeaders.push(StringSegment.from('PLACEHOLDER2'));

	cacheControl2.noCache = true;
	cacheControl2.noCacheHeaders.push(StringSegment.from('PLACEHOLDER1'));
	cacheControl2.noCacheHeaders.push(StringSegment.from('PLACEHOLDER2'));

	compareHashCodes(cacheControl1, cacheControl2, false);

	cacheControl1.noCacheHeaders.push(StringSegment.from('PLACEHOLDER1'));
	compareHashCodes(cacheControl1, cacheControl2, true);

	// Since NoCache and Private generate different hash codes, even if NoCacheHeaders and PrivateHeaders
	// have the same values, the hash code will be different.
	cacheControl3.private = true;
	cacheControl3.privateHeaders.push(StringSegment.from('PLACEHOLDER2'));
	compareHashCodes(cacheControl1, cacheControl3, false);

	cacheControl4.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	compareHashCodes(cacheControl1, cacheControl4, false);

	cacheControl5.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('customN'),
			StringSegment.from('customV'),
		),
	);
	cacheControl5.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	compareHashCodes(cacheControl4, cacheControl5, false);

	cacheControl4.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('customN'),
			StringSegment.from('customV'),
		),
	);
	compareHashCodes(cacheControl4, cacheControl5, true);
});

function compareValues(
	x: CacheControlHeaderValue,
	y: CacheControlHeaderValue,
	areEqual: boolean,
): void {
	expect(x.equals(y)).toBe(areEqual);
	expect(y.equals(x)).toBe(areEqual);
}

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L246C17-L246C71
test('Equals_CompareValuesWithBoolFieldsSet_MatchExpectation', () => {
	// Verify that different bool fields return different hash values.
	const values: CacheControlHeaderValue[] = new Array(9);

	for (let i = 0; i < values.length; i++) {
		values[i] = new CacheControlHeaderValue();
	}

	values[0].proxyRevalidate = true;
	values[1].noCache = true;
	values[2].noStore = true;
	values[3].maxStale = true;
	values[4].noTransform = true;
	values[5].onlyIfCached = true;
	values[6].public = true;
	values[7].private = true;
	values[8].mustRevalidate = true;

	// Only one bool field set. All hash codes should differ
	for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < values.length; j++) {
			if (i !== j) {
				compareValues(values[i], values[j], false);
			}
		}
	}

	// Validate that two instances with the same bool fields set are equal.
	values[0].noCache = true;
	compareValues(values[0], values[1], false);
	values[1].proxyRevalidate = true;
	compareValues(values[0], values[1], true);
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L286C17-L286C75
test('Equals_CompareValuesWithTimeSpanFieldsSet_MatchExpectation', () => {
	// Verify that different timespan fields return different hash values.
	const values: CacheControlHeaderValue[] = new Array(4);

	for (let i = 0; i < values.length; i++) {
		values[i] = new CacheControlHeaderValue();
	}

	values[0].maxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[1].maxStaleLimit = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[2].minFresh = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[3].sharedMaxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);

	// Only one timespan field set. All hash codes should differ
	for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < values.length; j++) {
			if (i !== j) {
				compareValues(values[i], values[j], false);
			}
		}
	}

	values[0].maxStaleLimit = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 2);
	compareValues(values[0], values[1], false);

	values[1].maxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 1);
	values[1].maxStaleLimit = TimeSpan.fromSeconds(0 * 60 * 60 + 1 * 60 + 2);
	compareValues(values[0], values[1], true);

	const value1 = new CacheControlHeaderValue();
	value1.maxStale = true;
	const value2 = new CacheControlHeaderValue();
	value2.maxStale = true;
	compareValues(value1, value2, true);

	value2.maxStaleLimit = TimeSpan.fromSeconds(1 * 60 * 60 + 2 * 60 + 3);
	compareValues(value1, value2, false);
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L331C17-L331C67
test('Equals_CompareCollectionFieldsSet_MatchExpectation', () => {
	const cacheControl1 = new CacheControlHeaderValue();
	const cacheControl2 = new CacheControlHeaderValue();
	const cacheControl3 = new CacheControlHeaderValue();
	const cacheControl4 = new CacheControlHeaderValue();
	const cacheControl5 = new CacheControlHeaderValue();
	const cacheControl6 = new CacheControlHeaderValue();

	cacheControl1.noCache = true;
	cacheControl1.noCacheHeaders.push(StringSegment.from('PLACEHOLDER2'));

	// TODO: expect(cacheControl1.equals(undefined!)).toBe(false);

	cacheControl2.noCache = true;
	cacheControl2.noCacheHeaders.push(StringSegment.from('PLACEHOLDER1'));
	cacheControl2.noCacheHeaders.push(StringSegment.from('PLACEHOLDER2'));

	compareValues(cacheControl1, cacheControl2, false);

	cacheControl1.noCacheHeaders.push(StringSegment.from('PLACEHOLDER1'));
	compareValues(cacheControl1, cacheControl2, true);

	// Since NoCache and Private generate different hash codes, even if NoCacheHeaders and PrivateHeaders
	// have the same values, the hash code will be different.
	cacheControl3.private = true;
	cacheControl3.privateHeaders.push(StringSegment.from('PLACEHOLDER2'));
	compareValues(cacheControl1, cacheControl3, false);

	cacheControl4.private = true;
	cacheControl4.privateHeaders.push(StringSegment.from('PLACEHOLDER3'));
	compareValues(cacheControl3, cacheControl4, false);

	cacheControl5.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	compareValues(cacheControl1, cacheControl5, false);

	cacheControl6.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('customN'),
			StringSegment.from('customV'),
		),
	);
	cacheControl6.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	compareValues(cacheControl5, cacheControl6, false);

	cacheControl5.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('customN'),
			StringSegment.from('customV'),
		),
	);
	compareValues(cacheControl5, cacheControl6, true);
});

function checkValidTryParse(
	input: string | undefined,
	expectedResult: CacheControlHeaderValue,
): void {
	let result: CacheControlHeaderValue | undefined;
	expect(
		CacheControlHeaderValue.tryParse(StringSegment.from(input), {
			set: (value) => (result = value),
		}),
	).toBe(true);
	expect(result!.equals(expectedResult)).toBe(true);
}

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L376
test('TryParse_DifferentValidScenarios_AllReturnTrue', () => {
	let expected = new CacheControlHeaderValue();
	expected.noCache = true;
	checkValidTryParse(' , no-cache ,,', expected);

	expected = new CacheControlHeaderValue();
	expected.noCache = true;
	expected.noCacheHeaders.push(StringSegment.from('PLACEHOLDER1'));
	expected.noCacheHeaders.push(StringSegment.from('PLACEHOLDER2'));
	checkValidTryParse('no-cache="PLACEHOLDER1, PLACEHOLDER2"', expected);

	expected = new CacheControlHeaderValue();
	expected.noStore = true;
	expected.maxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 0 * 60 + 125);
	expected.maxStale = true;
	checkValidTryParse(' no-store , max-age = 125, max-stale,', expected);

	expected = new CacheControlHeaderValue();
	expected.minFresh = TimeSpan.fromSeconds(0 * 60 * 60 + 0 * 60 + 123);
	expected.noTransform = true;
	expected.onlyIfCached = true;
	expected.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	checkValidTryParse(
		'min-fresh=123, no-transform, only-if-cached, custom',
		expected,
	);

	expected = new CacheControlHeaderValue();
	expected.public = true;
	expected.private = true;
	expected.privateHeaders.push(StringSegment.from('PLACEHOLDER1'));
	expected.mustRevalidate = true;
	expected.proxyRevalidate = true;
	expected.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('c'),
			StringSegment.from('d'),
		),
	);
	expected.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('a'),
			StringSegment.from('b'),
		),
	);
	checkValidTryParse(
		',public, , private="PLACEHOLDER1", must-revalidate, c=d, proxy-revalidate, a=b',
		expected,
	);

	expected = new CacheControlHeaderValue();
	expected.private = true;
	expected.sharedMaxAge = TimeSpan.fromSeconds(
		0 * 60 * 60 + 0 * 60 + 1234567890,
	);
	expected.maxAge = TimeSpan.fromSeconds(0 * 60 * 60 + 0 * 60 + 987654321);
	checkValidTryParse(
		's-maxage=1234567890, private, max-age = 987654321',
		expected,
	);

	expected = new CacheControlHeaderValue();
	expected.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('custom'),
			StringSegment.from(''),
		),
	);
	checkValidTryParse('custom=', expected);
});

function checkInvalidTryParse(input: string | undefined): void {
	let result: CacheControlHeaderValue | undefined;
	expect(
		CacheControlHeaderValue.tryParse(StringSegment.from(input), {
			set: (value) => (result = value),
		}),
	).toBe(false);
	expect(result).toBeUndefined();
}

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L471C17-L471C64
test('TryParse_DifferentInvalidScenarios_ReturnsFalse', () => {
	function TryParse_DifferentInvalidScenarios_ReturnsFalse(
		input: string,
	): void {
		checkInvalidTryParse(input);
	}

	TryParse_DifferentInvalidScenarios_ReturnsFalse(undefined!);
	TryParse_DifferentInvalidScenarios_ReturnsFalse('');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('    ');
	// PLACEHOLDER-only values
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-store=15');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-store=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-transform=a');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-transform=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('only-if-cached="x"');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('only-if-cached=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('public="x"');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('public=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('must-revalidate="1"');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('must-revalidate=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('proxy-revalidate=x');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('proxy-revalidate=');
	// PLACEHOLDER with optional field-name list
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-cache=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-cache=PLACEHOLDER');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-cache="PLACEHOLDER');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('no-cache=""'); // at least one PLACEHOLDER expected as value
	TryParse_DifferentInvalidScenarios_ReturnsFalse('private=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('private=PLACEHOLDER');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('private="PLACEHOLDER');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('private=","'); // at least one PLACEHOLDER expected as value
	TryParse_DifferentInvalidScenarios_ReturnsFalse('private="="');
	// PLACEHOLDER with delta-seconds value
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-age');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-age=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-age=a');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-age="1"');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-age=1.5');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-stale=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-stale=a');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-stale="1"');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('max-stale=1.5');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('min-fresh');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('min-fresh=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('min-fresh=a');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('min-fresh="1"');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('min-fresh=1.5');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('s-maxage');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('s-maxage=');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('s-maxage=a');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('s-maxage="1"');
	TryParse_DifferentInvalidScenarios_ReturnsFalse('s-maxage=1.5');
	// Invalid Extension values
	TryParse_DifferentInvalidScenarios_ReturnsFalse('custom value');
});

function checkValidParse(
	input: string | undefined,
	expectedResult: CacheControlHeaderValue,
): void {
	const result = CacheControlHeaderValue.parse(StringSegment.from(input));
	expect(result.equals(expectedResult)).toBe(true);
}

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L477C17-L477C61
test('Parse_SetOfValidValueStrings_ParsedCorrectly', () => {
	// Just verify parser is implemented correctly. Don't try to test syntax parsed by CacheControlHeaderValue.
	let expected = new CacheControlHeaderValue();
	expected.noStore = true;
	expected.minFresh = TimeSpan.fromSeconds(0 * 60 * 60 + 2 * 60 + 3);
	checkValidParse(' , no-store, min-fresh=123', expected);

	expected = new CacheControlHeaderValue();
	expected.maxStale = true;
	expected.noCache = true;
	expected.noCacheHeaders.push(StringSegment.from('t'));
	checkValidParse('max-stale, no-cache="t", ,,', expected);

	expected = new CacheControlHeaderValue();
	expected.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	checkValidParse('custom =', expected);

	expected = new CacheControlHeaderValue();
	expected.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('custom'),
			StringSegment.from(''),
		),
	);
	checkValidParse('custom =', expected);
});

function checkInvalidParse(input: string | undefined): void {
	expect(() =>
		CacheControlHeaderValue.parse(StringSegment.from(input)),
	).toThrowError(/* TODO */);
}

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L501C17-L501C54
test('Parse_SetOfInvalidValueStrings_Throws', () => {
	checkInvalidParse(undefined);
	checkInvalidParse('');
	checkInvalidParse('   ');
	checkInvalidParse('no-cache,=');
	checkInvalidParse('max-age=123x');
	checkInvalidParse('=no-cache');
	checkInvalidParse('no-cache no-store');
	checkInvalidParse('会');
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L514C17-L514C64
test('TryParse_SetOfValidValueStrings_ParsedCorrectly', () => {
	let expected = new CacheControlHeaderValue();
	expected.noStore = true;
	expected.minFresh = TimeSpan.fromSeconds(0 * 60 * 60 + 2 * 60 + 3);
	checkValidTryParse(' , no-store, min-fresh=123', expected);

	expected = new CacheControlHeaderValue();
	expected.maxStale = true;
	expected.noCache = true;
	expected.noCacheHeaders.push(StringSegment.from('t'));
	checkValidTryParse('max-stale, no-cache="t", ,,', expected);

	expected = new CacheControlHeaderValue();
	expected.extensions.push(
		new NameValueHeaderValue(StringSegment.from('custom')),
	);
	checkValidTryParse('custom = ', expected);

	expected = new CacheControlHeaderValue();
	expected.extensions.push(
		new NameValueHeaderValue(
			StringSegment.from('custom'),
			StringSegment.from(''),
		),
	);
	checkValidTryParse('custom =', expected);
});

// https://github.com/dotnet/aspnetcore/blob/e6be3e95fec33ca3a3b576df4b265ead680a91a0/src/Http/Headers/test/CacheControlHeaderValueTest.cs#L538C17-L538C63
test('TryParse_SetOfInvalidValueStrings_ReturnsFalse', () => {
	checkInvalidTryParse('no-cache,=');
	checkInvalidTryParse('max-age=123x');
	checkInvalidTryParse('=no-cache');
	checkInvalidTryParse('no-cache no-store');
	checkInvalidTryParse('会');
});
