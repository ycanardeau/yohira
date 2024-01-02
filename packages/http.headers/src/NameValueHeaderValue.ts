import { Out, StringBuilder } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

import { GenericHeaderParser } from './GenericHeaderParser';
import { HttpHeaderParser } from './HttpHeaderParser';
import { HttpParseResult } from './HttpParseResult';
import {
	getQuotedStringLength,
	getTokenLength,
	getWhitespaceLength,
} from './HttpRuleParser';

// https://source.dot.net/#Microsoft.Net.Http.Headers/NameValueHeaderValue.cs,6564791c0efa4d41,references
export class NameValueHeaderValue {
	constructor(
		private _name = StringSegment.from(undefined),
		private _value = StringSegment.from(undefined),
	) {}

	/**
	 * Gets the header name.
	 */
	get name(): StringSegment {
		return this._name;
	}

	/**
	 * Gets or sets the header value.
	 */
	get value(): StringSegment {
		return this._value;
	}
	set value(value: StringSegment) {
		// TODO: throwIfReadOnly
		// TODO: this.checkValueFormat(value)
		this._value = value;
	}

	/** @internal */ static toString(
		values: NameValueHeaderValue[] | undefined,
		separator: string,
		leadingSeparator: boolean,
		destination: StringBuilder,
	): void {
		if (destination === undefined) {
			throw new Error('Assertion failed.');
		}

		if (values === undefined || values.length === 0) {
			return;
		}

		for (let i = 0; i < values.length; i++) {
			if (leadingSeparator || destination.length > 0) {
				destination.appendString(separator);
				destination.appendString(' ');
			}
			destination.appendString(values[i].name.toString());
			if (!StringSegment.isNullOrEmpty(values[i].value)) {
				destination.appendString('=');
				destination.appendString(values[i].value.toString());
			}
		}
	}

	private static getValueLength(
		input: StringSegment,
		startIndex: number,
	): number {
		if (startIndex >= input.length) {
			return 0;
		}

		let valueLength = getTokenLength(input, startIndex);

		if (valueLength === 0) {
			// A value can either be a token or a quoted string. Check if it is a quoted string.
			if (
				getQuotedStringLength(input, startIndex, {
					set: (value) => (valueLength = value),
				}) !== HttpParseResult.Parsed
			) {
				// We have an invalid value. Reset the name and return.
				return 0;
			}
		}
		return valueLength;
	}

	private static getNameValueLength = (
		input: StringSegment,
		startIndex: number,
		parsedValue: Out<NameValueHeaderValue | undefined>,
	): number => {
		if (startIndex < 0) {
			throw new Error('Assertion failed.');
		}

		parsedValue.set(undefined);

		if (StringSegment.isNullOrEmpty(input) || startIndex >= input.length) {
			return 0;
		}

		// Parse the name, i.e. <name> in name/value string "<name>=<value>". Caller must remove
		// leading whitespaces.
		const nameLength = getTokenLength(input, startIndex);

		if (nameLength === 0) {
			return 0;
		}

		const name = input.subsegment(startIndex, nameLength);
		let current = startIndex + nameLength;
		current = current + getWhitespaceLength(input, current);

		// Parse the separator between name and value
		if (current === input.length || input.at(current) !== '=') {
			// We only have a name and that's OK. Return.
			parsedValue.set(
				((): NameValueHeaderValue => {
					const parsedValue = new NameValueHeaderValue();
					parsedValue._name = name;
					return parsedValue;
				})(),
			);
			current = current + getWhitespaceLength(input, current); // skip whitespaces
			return current - startIndex;
		}

		current++; // skip delimiter.
		current = current + getWhitespaceLength(input, current);

		// Parse the value, i.e. <value> in name/value string "<name>=<value>"
		const valueLength = NameValueHeaderValue.getValueLength(input, current);

		// Value after the '=' may be empty
		// Use parameterless ctor to avoid double-parsing of name and value, i.e. skip public ctor validation.
		parsedValue.set(
			((): NameValueHeaderValue => {
				const parsedValue = new NameValueHeaderValue();
				parsedValue._name = name;
				parsedValue._value = input.subsegment(current, valueLength);
				return parsedValue;
			})(),
		);
		current = current + valueLength;
		current = current + getWhitespaceLength(input, current); // skip whitespaces
		return current - startIndex;
	};

	/** @internal */ static readonly multipleValueParser: HttpHeaderParser<NameValueHeaderValue> =
		new GenericHeaderParser<NameValueHeaderValue>(
			true,
			NameValueHeaderValue.getNameValueLength,
		);

	equals(other: NameValueHeaderValue): boolean {
		if (!this._name.toLowerCase().equals(other._name.toLowerCase())) {
			return false;
		}

		// RFC2616: 14.20: unquoted tokens should use case-INsensitive comparison; quoted-strings should use
		// case-sensitive comparison. The RFC doesn't mention how to compare quoted-strings outside the "Expect"
		// header. We treat all quoted-strings the same: case-sensitive comparison.

		if (StringSegment.isNullOrEmpty(this._value)) {
			return StringSegment.isNullOrEmpty(other._value);
		}

		if (this._value.at(0) === '"') {
			// We have a quoted string, so we need to do case-sensitive comparison.
			return this._value.equals(other._value);
		} else {
			return this._value.toLowerCase().equals(other._value.toLowerCase());
		}
	}

	getHashCode(): number {
		if (this._name === undefined) {
			throw new Error('Assertion failed.');
		}

		const nameHashCode = this._name.toLowerCase().getHashCode();

		if (!StringSegment.isNullOrEmpty(this._value)) {
			// If we have a quoted-string, then just use the hash code. If we have a token, convert to lowercase
			// and retrieve the hash code.
			if (this._value.at(0) === '"') {
				return nameHashCode ^ this._value.getHashCode();
			}

			return nameHashCode ^ this._value.toLowerCase().getHashCode();
		}

		return nameHashCode;
	}
}
