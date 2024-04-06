import { Out, StringBuilder } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';
import { getTokenLength, getWhitespaceLength } from '@yohira/shared';

import { throwIfReadOnly } from './HeaderUtilities';
import { NameValueHeaderValue } from './NameValueHeaderValue';

// https://source.dot.net/#Microsoft.Net.Http.Headers/MediaTypeHeaderValue.cs,3107d1c70fb0fe7f,references
/**
 * Representation of the media type header. See {@link https://tools.ietf.org/html/rfc6838}.
 */
export class MediaTypeHeaderValue {
	private static readonly charsetString = 'charset';

	private _parameters: NameValueHeaderValue[] | undefined;
	private _isReadOnly = false;

	private static getMediaTypeExpressionLength(
		input: StringSegment,
		startIndex: number,
		mediaType: Out<StringSegment>,
	): number {
		if (!(input.length > 0 && startIndex < input.length)) {
			throw new Error('Assertion failed.');
		}

		// This method just parses the "type/subtype" string, it does not parse parameters.
		mediaType.set(StringSegment.from(undefined));

		// Parse the type, i.e. <type> in media type string "<type>/<subtype>; param1=value1; param2=value2"
		const typeLength = getTokenLength(input, startIndex);

		if (typeLength === 0) {
			return 0;
		}

		let current = startIndex + typeLength;
		current = current + getWhitespaceLength(input, current);

		// Parse the separator between type and subtype
		if (current >= input.length || input.at(current) !== '/') {
			return 0;
		}
		current++; // skip delimiter.
		current = current + getWhitespaceLength(input, current);

		// Parse the subtype, i.e. <subtype> in media type string "<type>/<subtype>; param1=value1; param2=value2"
		const subtypeLength = getTokenLength(input, current);

		if (subtypeLength === 0) {
			return 0;
		}

		// If there is no whitespace between <type> and <subtype> in <type>/<subtype> get the media type using
		// one Substring call. Otherwise get substrings for <type> and <subtype> and combine them.
		const mediaTypeLength = current + subtypeLength - startIndex;
		if (typeLength + subtypeLength + 1 === mediaTypeLength) {
			mediaType.set(input.subsegment(startIndex, mediaTypeLength));
		} else {
			mediaType.set(
				StringSegment.from(
					[
						input
							.toString()
							.slice(startIndex, startIndex + typeLength),
						'/',
						input
							.toString()
							.slice(current, current + subtypeLength),
					].join(''),
				),
			);
		}

		return mediaTypeLength;
	}

	private static checkMediaTypeFormat(
		mediaType: StringSegment,
		parameterName: string,
	): void {
		if (StringSegment.isNullOrEmpty(mediaType)) {
			throw new Error('An empty string is not allowed.');
		}

		// When adding values using strongly typed objects, no leading/trailing LWS (whitespace) is allowed.
		// Also no LWS between type and subtype is allowed.
		let tempMediaType: StringSegment | undefined = undefined;
		const mediaTypeLength =
			MediaTypeHeaderValue.getMediaTypeExpressionLength(mediaType, 0, {
				set: (value) => (tempMediaType = value),
			});
		if (
			mediaTypeLength === 0 ||
			tempMediaType!.length !== mediaType.length
		) {
			throw new Error(`Invalid media type '${mediaType}'.`);
		}
	}

	constructor(private mediaType: StringSegment) {
		MediaTypeHeaderValue.checkMediaTypeFormat(mediaType, 'mediaType');
	}

	/**
	 * Gets whether the {@link MediaTypeHeaderValue} is readonly.
	 */
	get isReadOnly(): boolean {
		return this._isReadOnly;
	}

	get charset(): StringSegment {
		return (
			NameValueHeaderValue.find(
				this._parameters,
				StringSegment.from(MediaTypeHeaderValue.charsetString),
			)?.value ?? StringSegment.from(undefined)
		);
	}
	set charset(value: StringSegment) {
		throwIfReadOnly(this.isReadOnly);
		// We don't prevent a user from setting whitespace-only charsets. Like we can't prevent a user from
		// setting a non-existing charset.
		const charsetParameter = NameValueHeaderValue.find(
			this._parameters,
			StringSegment.from(MediaTypeHeaderValue.charsetString),
		);
		if (StringSegment.isNullOrEmpty(value)) {
			// Remove charset parameter
			if (charsetParameter !== undefined) {
				this.parameters.splice(
					this.parameters.indexOf(charsetParameter),
					1,
				); /* TODO: remove */
			}
		} else {
			if (charsetParameter !== undefined) {
				charsetParameter.value = value;
			} else {
				this.parameters.push(
					new NameValueHeaderValue(
						StringSegment.from(MediaTypeHeaderValue.charsetString),
						value,
					),
				);
			}
		}
	}

	get parameters(): NameValueHeaderValue[] {
		if (this._parameters === undefined) {
			if (this.isReadOnly) {
				throw new Error('Method not implemented.');
			} else {
				this._parameters = [];
			}
		}
		return this._parameters;
	}

	toString(): string {
		const builder = new StringBuilder();
		builder.appendString(this.mediaType.toString());
		NameValueHeaderValue.toString(this._parameters, ';', true, builder);
		return builder.toString();
	}
}
