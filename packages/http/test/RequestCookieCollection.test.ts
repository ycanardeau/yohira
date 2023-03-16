import { StringValues } from '@yohira/extensions.primitives';
import { RequestCookieCollection } from '@yohira/http';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/de8a676644bbab2c40c31de44094f43162d003c5/src/Http/Http/test/RequestCookiesCollectionTests.cs#L16
test('UnEscapesValues', () => {
	function UnEscapesValues(
		input: string,
		expectedKey: string,
		expectedValue: string,
	): void {
		const cookies = RequestCookieCollection.parse(new StringValues(input));

		expect(cookies.count).toBe(1);
		expect(cookies.keys.length).toBe(1);
		expect(cookies.keys[0]).toBe(expectedKey.toLowerCase() /* REVIEW */);
		expect(cookies.get(expectedKey)).toBe(expectedValue);
	}

	UnEscapesValues('key=value', 'key', 'value');
	UnEscapesValues('key%2C=%21value', 'key%2C', '!value');
	UnEscapesValues('ke%23y%2C=val%5Eue', 'ke%23y%2C', 'val^ue');
	UnEscapesValues('base64=QUI%2BREU%2FRw%3D%3D', 'base64', 'QUI+REU/Rw==');
	UnEscapesValues('base64=QUI+REU/Rw==', 'base64', 'QUI+REU/Rw==');
});

// https://github.com/dotnet/aspnetcore/blob/de8a676644bbab2c40c31de44094f43162d003c5/src/Http/Http/test/RequestCookiesCollectionTests.cs#L26
test('ParseManyCookies', () => {
	const cookies = RequestCookieCollection.parse(
		new StringValues([
			'a=a',
			'b=b',
			'c=c',
			'd=d',
			'e=e',
			'f=f',
			'g=g',
			'h=h',
			'i=i',
			'j=j',
			'k=k',
			'l=l',
		]),
	);

	expect(cookies.count).toBe(12);
});

// https://github.com/dotnet/aspnetcore/blob/de8a676644bbab2c40c31de44094f43162d003c5/src/Http/Http/test/RequestCookiesCollectionTests.cs#L40
test('ParseInvalidCookies', () => {
	function ParseInvalidCookies(
		cookieToParse: string,
		expectedCookieValues: string[] | undefined,
	): void {
		const cookies = RequestCookieCollection.parse(
			new StringValues(cookieToParse),
		);

		if (expectedCookieValues === undefined) {
			expect(cookies.count).toBe(0);
			return;
		}

		expect(expectedCookieValues.length).toBe(cookies.count);
		for (let i = 0; i < expectedCookieValues.length; i++) {
			const value = expectedCookieValues[i];
			expect(Array.from(cookies)[i][1]).toBe(value);
		}
	}

	ParseInvalidCookies(',', undefined);
	ParseInvalidCookies(';', undefined);
	ParseInvalidCookies('er=dd,cc,bb', ['dd']);
	ParseInvalidCookies('er=dd,err=cc,errr=bb', ['dd', 'cc', 'bb']);
	ParseInvalidCookies('errorcookie=dd,:("sa;', ['dd']);
	ParseInvalidCookies('s;', undefined);
});
