import { StringSegment } from '@yohira/extensions.primitives';
import { getCookieValue } from '@yohira/http.shared';
import { getTokenLength } from '@yohira/shared';

// https://source.dot.net/#Microsoft.Net.Http.Headers/CookieHeaderValue.cs,da9828b608c66e98,references
export function checkNameFormat(
	name: StringSegment,
	parameterName: string,
): void {
	if (name.equals(StringSegment.from(undefined))) {
		throw new Error('Value cannot be undefined.');
	}

	if (getTokenLength(name, 0) !== name.length) {
		throw new Error(`Invalid cookie name: ${name.toString()}`);
	}
}

// https://source.dot.net/#Microsoft.Net.Http.Headers/CookieHeaderValue.cs,0623e558daf38793,references
export function checkValueFormat(
	value: StringSegment,
	parameterName: string,
): void {
	if (value.equals(StringSegment.from(undefined))) {
		throw new Error('Value cannot be undefined.');
	}

	let offset = 0;
	const result = getCookieValue(value, {
		get: () => offset,
		set: (value) => (offset = value),
	});
	if (result.length !== value.length) {
		throw new Error(`Invalid cookie value: ${value.toString()}`);
	}
}
