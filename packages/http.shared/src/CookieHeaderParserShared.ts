import { Ref, unescapeDataString } from '@yohira/base';
import { StringSegment, StringValues } from '@yohira/extensions.primitives';
import { getTokenLength, getWhitespaceLength } from '@yohira/shared';
import { Err, Ok, Result } from '@yohira/third-party.ts-results';

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Http/Shared/CookieHeaderParserShared.cs,be4353ca75c3c84c,references
function getNextNonEmptyOrWhitespaceIndex(
	input: StringSegment,
	startIndex: number,
	skipEmptyValues: boolean,
	separatorFound: { set: (value: boolean) => void },
): number {
	if (startIndex > input.length) {
		throw new Error('Assertion failed.');
	}

	separatorFound.set(false);
	let current = startIndex + getWhitespaceLength(input, startIndex);

	if (
		current === input.length ||
		(input.at(current) !== ',' && input.at(current) !== ';')
	) {
		return current;
	}

	// If we have a separator, skip the separator and all following whitespaces. If we support
	// empty values, continue until the current character is neither a separator nor a whitespace.
	separatorFound.set(true);
	current++; // skip delimiter.
	current = current + getWhitespaceLength(input, current);

	if (skipEmptyValues) {
		// Most headers only split on ',', but cookies primarily split on ';'
		while (
			current < input.length &&
			(input.at(current) === ',' || input.at(current) === ';')
		) {
			current++; // skip delimiter.
			current = current + getWhitespaceLength(input, current);
		}
	}

	return current;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Http/Shared/CookieHeaderParserShared.cs,ce514a08e51f183e,references
function readEqualsSign(input: StringSegment, offset: Ref<number>): boolean {
	// = (no spaces)
	if (offset.get() >= input.length || input.at(offset.get()) !== '=') {
		return false;
	}
	offset.set(offset.get() + 1);
	return true;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Http/Shared/CookieHeaderParserShared.cs,94225aa5f7e8fce5,references
// cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
//                     ; US-ASCII characters excluding CTLs, whitespace DQUOTE, comma, semicolon, and backslash
function isCookieValueChar(c: string): boolean {
	if (c.charCodeAt(0) < 0x21 || c.charCodeAt(0) > 0x7e) {
		return false;
	}
	return !(c === '"' || c === ',' || c === ';' || c === '\\');
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Http/Shared/CookieHeaderParserShared.cs,a3d5a41d577377f5,references
// cookie-value      = *cookie-octet / ( DQUOTE* cookie-octet DQUOTE )
// cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
//                     ; US-ASCII characters excluding CTLs, whitespace DQUOTE, comma, semicolon, and backslash
export function getCookieValue(
	input: StringSegment,
	offset: Ref<number>,
): StringSegment {
	if (offset.get() < 0) {
		throw new Error('Assertion failed.');
	}
	// TODO: Contract.ensures

	const startIndex = offset.get();

	if (offset.get() >= input.length) {
		return StringSegment.empty;
	}
	let inQuotes = false;

	if (input.at(offset.get()) === '"') {
		inQuotes = true;
		offset.set(offset.get() + 1);
	}

	while (offset.get() < input.length) {
		const c = input.at(offset.get());
		if (!isCookieValueChar(c)) {
			break;
		}

		offset.set(offset.get() + 1);
	}

	if (inQuotes) {
		if (offset.get() === input.length || input.at(offset.get()) !== '"') {
			// Missing final quote
			return StringSegment.empty;
		}
		offset.set(offset.get() + 1);
	}

	const length = offset.get() - startIndex;
	if (offset.get() > startIndex) {
		return input.subsegment(startIndex, length);
	}

	return StringSegment.empty;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Http/Shared/CookieHeaderParserShared.cs,67c727301578df10,references
// name=value; name="value"
function tryGetCookieLength(
	input: StringSegment,
	offset: Ref<number>,
): Result<
	{
		parsedName: StringSegment | undefined;
		parsedValue: StringSegment | undefined;
	},
	undefined
> {
	if (offset.get() < 0) {
		throw new Error('Assertion failed.');
	}

	let parsedName: StringSegment | undefined = undefined;
	let parsedValue: StringSegment | undefined = undefined;

	if (StringSegment.isNullOrEmpty(input) || offset.get() >= input.length) {
		return new Err(undefined);
	}

	// The caller should have already consumed any leading whitespace, commas, etc..

	// Name=value;

	// Name
	const itemLength = getTokenLength(input, offset.get());
	if (itemLength === 0) {
		return new Err(undefined);
	}

	parsedName = input.subsegment(offset.get(), itemLength);
	offset.set(offset.get() + itemLength);

	// = (no spaces)
	if (!readEqualsSign(input, offset)) {
		return new Err(undefined);
	}

	// value or "quoted value"
	// The value may be empty
	parsedValue = getCookieValue(input, offset);

	return new Ok({ parsedName, parsedValue });
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Http/Shared/CookieHeaderParserShared.cs,646957513617b4cb,references
function tryParseCookieHeaderValue(
	value: StringSegment,
	index: Ref<number>,
	supportsMultipleValues: boolean,
): Result<
	{
		parsedName: StringSegment | undefined;
		parsedValue: StringSegment | undefined;
	},
	undefined
> {
	let parsedName: StringSegment | undefined = undefined;
	let parsedValue: StringSegment | undefined = undefined;

	// If multiple values are supported (i.e. list of values), then accept an empty string: The header may
	// be added multiple times to the request/response message. E.g.
	//  Accept: text/xml; q=1
	//  Accept:
	//  Accept: text/plain; q=0.2
	if (StringSegment.isNullOrEmpty(value) || index.get() === value.length) {
		return supportsMultipleValues
			? new Ok({ parsedName, parsedValue })
			: new Err(undefined);
	}

	let separatorFound = false;
	let current = getNextNonEmptyOrWhitespaceIndex(
		value,
		index.get(),
		supportsMultipleValues,
		{
			set: (value) => (separatorFound = value),
		},
	);
	if (separatorFound && !supportsMultipleValues) {
		return new Err(undefined); // leading separators not allowed if we don't support multiple values.
	}

	if (current === value.length) {
		if (supportsMultipleValues) {
			index.set(current);
		}
		return supportsMultipleValues
			? new Ok({ parsedName, parsedValue })
			: new Err(undefined);
	}

	const tryGetCookieLengthResult = tryGetCookieLength(value, {
		get: () => current,
		set: (value) => (current = value),
	});
	if (!tryGetCookieLengthResult.ok) {
		return new Err(undefined);
	}
	parsedName = tryGetCookieLengthResult.val.parsedName;
	parsedValue = tryGetCookieLengthResult.val.parsedValue;

	current = getNextNonEmptyOrWhitespaceIndex(
		value,
		current,
		supportsMultipleValues,
		{
			set: (value) => (separatorFound = value),
		},
	);

	// If we support multiple values and we've not reached the end of the string, then we must have a separator.
	if (
		(separatorFound && !supportsMultipleValues) ||
		(!separatorFound && current < value.length)
	) {
		return new Err(undefined);
	}

	index.set(current);

	return new Ok({ parsedName, parsedValue });
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Http/Shared/CookieHeaderParserShared.cs,279a231d46e5a05d,references
export function tryParseCookieHeaderValues(
	values: StringValues,
	store: Map<string, string>,
	supportsMultipleValues: boolean,
): boolean {
	// If a parser returns an empty list, it means there was no value, but that's valid (e.g. "Accept: "). The caller
	// can ignore the value.
	if (values.count === 0) {
		return false;
	}
	let hasFoundValue = false;

	for (let i = 0; i < values.count; i++) {
		const value = values.at(i);
		let index = 0;

		while (value && index < value.length) {
			const tryParseCookieHeaderValueResult = tryParseCookieHeaderValue(
				StringSegment.from(value),
				{
					get: () => index,
					set: (value) => (index = value),
				},
				supportsMultipleValues,
			);
			if (tryParseCookieHeaderValueResult.ok) {
				const { parsedName, parsedValue } =
					tryParseCookieHeaderValueResult.val;
				if (
					parsedName === undefined ||
					StringSegment.isNullOrEmpty(parsedName) ||
					parsedValue === undefined ||
					StringSegment.isNullOrEmpty(parsedValue)
				) {
					// Successfully parsed, but no values.
					continue;
				}

				// The entry may not contain an actual value, like " , "
				store.set(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					parsedName.value!,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					unescapeDataString(parsedValue.value!),
				);
				hasFoundValue = true;
			} else {
				// Skip the invalid values and keep trying.
				index++;
			}
		}
	}

	return hasFoundValue;
}
