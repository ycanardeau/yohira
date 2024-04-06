import { StringSegment } from '@yohira/extensions.primitives';
import {
	MediaTypeHeaderValue,
	NameValueHeaderValue,
} from '@yohira/http.headers';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/16ae0ab9c61c994048513cd8fa3127608b7ec936/src/Http/Headers/test/MediaTypeHeaderValueTest.cs#L11C17-L11C41
test('Ctor_MediaTypeNull_Throw', () => {
	expect(
		() => new MediaTypeHeaderValue(StringSegment.from(undefined)),
	).toThrowError('An empty string is not allowed.');
	// null and empty should be treated the same. So we also throw for empty strings.
	expect(() => new MediaTypeHeaderValue(StringSegment.from(''))).toThrowError(
		'An empty string is not allowed.',
	);
});

function AssertFormatException(mediaType: string): void {
	expect(
		() => new MediaTypeHeaderValue(StringSegment.from(mediaType)),
	).toThrowError('Invalid media type');
}

// https://github.com/dotnet/aspnetcore/blob/16ae0ab9c61c994048513cd8fa3127608b7ec936/src/Http/Headers/test/MediaTypeHeaderValueTest.cs#L19C17-L19C65
test('Ctor_MediaTypeInvalidFormat_ThrowFormatException', () => {
	// When adding values using strongly typed objects, no leading/trailing LWS (whitespaces) are allowed.
	AssertFormatException(' text/plain ');
	AssertFormatException('text / plain');
	AssertFormatException('text/ plain');
	AssertFormatException('text /plain');
	AssertFormatException('text/plain ');
	AssertFormatException(' text/plain');
	AssertFormatException('te xt/plain');
	AssertFormatException('te=xt/plain');
	AssertFormatException('teäxt/plain');
	AssertFormatException('text/pläin');
	AssertFormatException('text');
	AssertFormatException('"text/plain"');
	AssertFormatException('text/plain; charset=utf-8; ');
	AssertFormatException('text/plain;');
	AssertFormatException('text/plain;charset=utf-8'); // ctor takes only media-type name, no parameters
});

// TODO

test('ToString_UseDifferentMediaTypes_AllSerializedCorrectly', () => {
	const mediaType = new MediaTypeHeaderValue(
		StringSegment.from('text/plain'),
	);
	expect(mediaType.toString()).toBe('text/plain');

	mediaType.charset = StringSegment.from('utf-8');
	expect(mediaType.toString()).toBe('text/plain; charset=utf-8');

	mediaType.parameters.push(
		new NameValueHeaderValue(
			StringSegment.from('custom'),
			StringSegment.from('"custom value"'),
		),
	);
	expect(mediaType.toString()).toBe(
		'text/plain; charset=utf-8; custom="custom value"',
	);

	mediaType.charset = StringSegment.from(undefined);
	expect(mediaType.toString()).toBe('text/plain; custom="custom value"');
});

// TODO
