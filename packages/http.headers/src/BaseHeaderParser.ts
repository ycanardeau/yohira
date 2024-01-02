import { Out, Ref } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

import { getNextNonEmptyOrWhitespaceIndex } from './HeaderUtilities';
import { HttpHeaderParser } from './HttpHeaderParser';

// https://source.dot.net/#Microsoft.Net.Http.Headers/BaseHeaderParser.cs,e25643cee3c3c3f5,references
export abstract class BaseHeaderParser<T> extends HttpHeaderParser<T> {
	protected constructor(supportsMultipleValues: boolean) {
		super(supportsMultipleValues);
	}

	protected abstract getParsedValueLength(
		value: StringSegment,
		startIndex: number,
		parsedValue: Out<T | undefined>,
	): number;

	tryParseValue(
		value: StringSegment,
		index: Ref<number>,
		parsedValue: Out<T | undefined>,
	): boolean {
		parsedValue.set(undefined);

		// If multiple values are supported (i.e. list of values), then accept an empty string: The header may
		// be added multiple times to the request/response message. E.g.
		//  Accept: text/xml; q=1
		//  Accept:
		//  Accept: text/plain; q=0.2
		if (
			StringSegment.isNullOrEmpty(value) ||
			index.get() === value.length
		) {
			return this.supportsMultipleValues;
		}

		let separatorFound = false;
		let current = getNextNonEmptyOrWhitespaceIndex(
			value,
			index.get(),
			this.supportsMultipleValues,
			{
				set: (value) => (separatorFound = value),
			},
		);

		if (separatorFound && !this.supportsMultipleValues) {
			return false; // leading separators not allowed if we don't support multiple values.
		}

		if (current === value.length) {
			if (this.supportsMultipleValues) {
				index.set(current);
			}
			return this.supportsMultipleValues;
		}

		let result: T | undefined;
		const length = this.getParsedValueLength(value, current, {
			set: (value) => (result = value),
		});

		if (length === 0) {
			return false;
		}

		current = current + length;
		current = getNextNonEmptyOrWhitespaceIndex(
			value,
			current,
			this.supportsMultipleValues,
			{
				set: (value) => (separatorFound = value),
			},
		);

		// If we support multiple values and we've not reached the end of the string, then we must have a separator.
		if (
			(separatorFound && !this.supportsMultipleValues) ||
			(!separatorFound && current < value.length)
		) {
			return false;
		}

		index.set(current);
		parsedValue.set(result);
		return true;
	}
}
