import { Out, Ref, StringBuilder, TimeSpan, getHashCode } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

import { GenericHeaderParser } from './GenericHeaderParser';
import {
	areEqualCollections,
	getNextNonEmptyOrWhitespaceIndex,
	tryParseNonNegativeInt32,
} from './HeaderUtilities';
import { HttpHeaderParser } from './HttpHeaderParser';
import { getTokenLength } from './HttpRuleParser';
import { NameValueHeaderValue } from './NameValueHeaderValue';

// https://source.dot.net/#Microsoft.Net.Http.Headers/CacheControlHeaderValue.cs,76dcfdf773e9ecc5,references
/**
 * Represents the <c>Cache-Control</c> HTTP header.
 */
export class CacheControlHeaderValue {
	/**
	 * A constant for the <c>public</c> cache-control directive.
	 */
	static readonly publicString = 'public';

	/**
	 * A constant for the <c>private</c> cache-control directive.
	 */
	static readonly privateString = 'private';

	/**
	 * A constant for the <c>max-age</c> cache-control directive.
	 */
	static readonly maxAgeString = 'max-age';

	/**
	 * A constant for the <c>s-maxage</c> cache-control directive.
	 */
	static readonly sharedMaxAgeString = 's-maxage';

	/**
	 * A constant for the <c>no-cache</c> cache-control directive.
	 */
	static readonly noCacheString = 'no-cache';

	/**
	 * A constant for the <c>no-store</c> cache-control directive.
	 */
	static readonly noStoreString = 'no-store';

	/**
	 * A constant for the <c>max-stale</c> cache-control directive.
	 */
	static readonly maxStaleString = 'max-stale';

	/**
	 * A constant for the <c>min-fresh</c> cache-control directive.
	 */
	static readonly minFreshString = 'min-fresh';

	/**
	 * A constant for the <c>no-transform</c> cache-control directive.
	 */
	static readonly noTransformString = 'no-transform';

	/**
	 * A constant for the <c>only-if-cached</c> cache-control directive.
	 */
	static readonly onlyIfCachedString = 'only-if-cached';

	/**
	 * A constant for the <c>must-revalidate</c> cache-control directive.
	 */
	static readonly mustRevalidateString = 'must-revalidate';

	/**
	 * A constant for the <c>proxy-revalidate</c> cache-control directive.
	 */
	static readonly proxyRevalidateString = 'proxy-revalidate';

	private _noCache = false;
	private _noCacheHeaders: StringSegment[] | undefined;
	private _noStore = false;
	private _maxAge: TimeSpan | undefined;
	private _sharedMaxAge: TimeSpan | undefined;
	private _maxStale = false;
	private _maxStaleLimit: TimeSpan | undefined;
	private _minFresh: TimeSpan | undefined;
	private _noTransform = false;
	private _onlyIfCached = false;
	private _public = false;
	private _private = false;
	private _privateHeaders: StringSegment[] | undefined;
	private _mustRevalidate = false;
	private _proxyRevalidate = false;
	private _extensions: NameValueHeaderValue[] | undefined;

	get noCache(): boolean {
		return this._noCache;
	}
	set noCache(value: boolean) {
		this._noCache = value;
	}

	/**
	 * Gets a collection of field names in the "no-cache" directive in a cache-control header field on an HTTP response.
	 */
	get noCacheHeaders(): StringSegment[] {
		if (this._noCacheHeaders === undefined) {
			this._noCacheHeaders =
				[]; /* TODO: ObjectCollection<StringSegment> */
		}
		return this._noCacheHeaders;
	}

	get noStore(): boolean {
		return this._noStore;
	}
	set noStore(value: boolean) {
		this._noStore = value;
	}

	get maxAge(): TimeSpan | undefined {
		return this._maxAge;
	}
	set maxAge(value: TimeSpan | undefined) {
		this._maxAge = value;
	}

	get sharedMaxAge(): TimeSpan | undefined {
		return this._sharedMaxAge;
	}
	set sharedMaxAge(value: TimeSpan | undefined) {
		this._sharedMaxAge = value;
	}

	get maxStale(): boolean {
		return this._maxStale;
	}
	set maxStale(value: boolean) {
		this._maxStale = value;
	}

	get maxStaleLimit(): TimeSpan | undefined {
		return this._maxStaleLimit;
	}
	set maxStaleLimit(value: TimeSpan | undefined) {
		this._maxStaleLimit = value;
	}

	get minFresh(): TimeSpan | undefined {
		return this._minFresh;
	}
	set minFresh(value: TimeSpan | undefined) {
		this._minFresh = value;
	}

	get noTransform(): boolean {
		return this._noTransform;
	}
	set noTransform(value: boolean) {
		this._noTransform = value;
	}

	get onlyIfCached(): boolean {
		return this._onlyIfCached;
	}
	set onlyIfCached(value: boolean) {
		this._onlyIfCached = value;
	}

	get public(): boolean {
		return this._public;
	}
	set public(value: boolean) {
		this._public = value;
	}

	get private(): boolean {
		return this._private;
	}
	set private(value: boolean) {
		this._private = value;
	}

	get privateHeaders(): StringSegment[] {
		if (this._privateHeaders === undefined) {
			this._privateHeaders =
				[]; /* TODO: ObjectCollection<StringSegment> */
		}
		return this._privateHeaders;
	}

	get mustRevalidate(): boolean {
		return this._mustRevalidate;
	}
	set mustRevalidate(value: boolean) {
		this._mustRevalidate = value;
	}

	get proxyRevalidate(): boolean {
		return this._proxyRevalidate;
	}
	set proxyRevalidate(value: boolean) {
		this._proxyRevalidate = value;
	}

	get extensions(): NameValueHeaderValue[] {
		if (this._extensions === undefined) {
			this._extensions =
				[] /* TODO: ObjectCollection<NameValueHeaderValue> */;
		}
		return this._extensions;
	}

	private static appendValueWithSeparatorIfRequired(
		sb: StringBuilder,
		value: string,
	): void {
		if (sb.length > 0) {
			sb.appendString(', ');
		}
		sb.appendString(value);
	}

	private static appendValueIfRequired(
		sb: StringBuilder,
		appendValue: boolean,
		value: string,
	): void {
		if (appendValue) {
			CacheControlHeaderValue.appendValueWithSeparatorIfRequired(
				sb,
				value,
			);
		}
	}

	private static appendValues(
		sb: StringBuilder,
		values: StringSegment[],
	): void {
		let first = true;
		for (const value of values) {
			if (first) {
				first = false;
			} else {
				sb.appendString(', ');
			}

			sb.appendString(value.toString());
		}
	}

	toString(): string {
		const sb = new StringBuilder();

		CacheControlHeaderValue.appendValueIfRequired(
			sb,
			this._noStore,
			CacheControlHeaderValue.noStoreString,
		);
		CacheControlHeaderValue.appendValueIfRequired(
			sb,
			this._noTransform,
			CacheControlHeaderValue.noTransformString,
		);
		CacheControlHeaderValue.appendValueIfRequired(
			sb,
			this._onlyIfCached,
			CacheControlHeaderValue.onlyIfCachedString,
		);
		CacheControlHeaderValue.appendValueIfRequired(
			sb,
			this._public,
			CacheControlHeaderValue.publicString,
		);
		CacheControlHeaderValue.appendValueIfRequired(
			sb,
			this._mustRevalidate,
			CacheControlHeaderValue.mustRevalidateString,
		);
		CacheControlHeaderValue.appendValueIfRequired(
			sb,
			this._proxyRevalidate,
			CacheControlHeaderValue.proxyRevalidateString,
		);

		if (this._noCache) {
			CacheControlHeaderValue.appendValueWithSeparatorIfRequired(
				sb,
				CacheControlHeaderValue.noCacheString,
			);
			if (
				this._noCacheHeaders !== undefined &&
				this._noCacheHeaders.length > 0
			) {
				sb.appendString('="');
				CacheControlHeaderValue.appendValues(sb, this.noCacheHeaders);
				sb.appendString('"');
			}
		}

		if (this._maxAge !== undefined) {
			CacheControlHeaderValue.appendValueWithSeparatorIfRequired(
				sb,
				CacheControlHeaderValue.maxAgeString,
			);
			sb.appendString('=');
			sb.appendString(this._maxAge.totalSeconds.toString());
		}

		if (this._sharedMaxAge !== undefined) {
			CacheControlHeaderValue.appendValueWithSeparatorIfRequired(
				sb,
				CacheControlHeaderValue.sharedMaxAgeString,
			);
			sb.appendString('=');
			sb.appendString(this._sharedMaxAge.totalSeconds.toString());
		}

		if (this._maxStale) {
			CacheControlHeaderValue.appendValueWithSeparatorIfRequired(
				sb,
				CacheControlHeaderValue.maxStaleString,
			);
			if (this._maxStaleLimit !== undefined) {
				sb.appendString('=');
				sb.appendString(this._maxStaleLimit.totalSeconds.toString());
			}
		}

		if (this._minFresh !== undefined) {
			CacheControlHeaderValue.appendValueWithSeparatorIfRequired(
				sb,
				CacheControlHeaderValue.minFreshString,
			);
			sb.appendString('=');
			sb.appendString(this._minFresh.totalSeconds.toString());
		}

		if (this._private) {
			CacheControlHeaderValue.appendValueWithSeparatorIfRequired(
				sb,
				CacheControlHeaderValue.privateString,
			);
			if (
				this._privateHeaders !== undefined &&
				this._privateHeaders.length > 0
			) {
				sb.appendString('="');
				CacheControlHeaderValue.appendValues(sb, this._privateHeaders);
				sb.appendString('"');
			}
		}

		NameValueHeaderValue.toString(this._extensions, ',', false, sb);

		return sb.toString();
	}

	equals(other: CacheControlHeaderValue): boolean {
		if (
			this._noCache !== other._noCache ||
			this._noStore !== other._noStore ||
			!TimeSpan.equals(this._maxAge, other._maxAge) ||
			!TimeSpan.equals(this._sharedMaxAge, other._sharedMaxAge) ||
			this._maxStale !== other._maxStale ||
			!TimeSpan.equals(this._maxStaleLimit, other._maxStaleLimit) ||
			!TimeSpan.equals(this._minFresh, other._minFresh) ||
			this._noTransform !== other._noTransform ||
			this._onlyIfCached !== other._onlyIfCached ||
			this._public !== other._public ||
			this._private !== other._private ||
			this._mustRevalidate !== other._mustRevalidate ||
			this._proxyRevalidate !== other._proxyRevalidate
		) {
			return false;
		}

		if (
			!areEqualCollections(this._noCacheHeaders, other._noCacheHeaders, {
				equals: (x, y) => x.toLowerCase().equals(y.toLowerCase()),
			})
		) {
			return false;
		}

		if (
			!areEqualCollections(this._privateHeaders, other._privateHeaders, {
				equals: (x, y) => x.toLowerCase().equals(y.toLowerCase()),
			})
		) {
			return false;
		}

		if (!areEqualCollections(this._extensions, other._extensions)) {
			return false;
		}

		return true;
	}

	getHashCode(): number {
		// Use a different bit for bool fields: bool.GetHashCode() will return 0 (false) or 1 (true). So we would
		// end up having the same hash code for e.g. two instances where one has only noCache set and the other
		// only noStore.
		let result =
			getHashCode(this._noCache) ^
			(getHashCode(this._noStore) << 1) ^
			(getHashCode(this._maxStale) << 2) ^
			(getHashCode(this._noTransform) << 3) ^
			(getHashCode(this._onlyIfCached) << 4) ^
			(getHashCode(this._public) << 5) ^
			(getHashCode(this._private) << 6) ^
			(getHashCode(this._mustRevalidate) << 7) ^
			(getHashCode(this._proxyRevalidate) << 8);

		// XOR the hashcode of timespan values with different numbers to make sure two instances with the same
		// timespan set on different fields result in different hashcodes.
		result =
			result ^
			(this._maxAge !== undefined ? this._maxAge.getHashCode() ^ 1 : 0) ^
			(this._sharedMaxAge !== undefined
				? this._sharedMaxAge.getHashCode() ^ 2
				: 0) ^
			(this._maxStaleLimit !== undefined
				? this._maxStaleLimit.getHashCode() ^ 4
				: 0) ^
			(this._minFresh !== undefined
				? this._minFresh.getHashCode() ^ 8
				: 0);

		if (
			this._noCacheHeaders !== undefined &&
			this._noCacheHeaders.length > 0
		) {
			for (const noCacheHeader of this._noCacheHeaders) {
				result = result ^ noCacheHeader.toLowerCase().getHashCode();
			}
		}

		if (
			this._privateHeaders !== undefined &&
			this._privateHeaders.length > 0
		) {
			for (const privateHeader of this._privateHeaders) {
				result = result ^ privateHeader.toLowerCase().getHashCode();
			}
		}

		if (this._extensions !== undefined && this._extensions.length > 0) {
			for (const extension of this._extensions) {
				result = result ^ extension.getHashCode();
			}
		}

		return result;
	}

	private static trySetTokenOnlyValue(
		nameValue: NameValueHeaderValue,
		boolField: Ref<boolean>,
	): boolean {
		if (!nameValue.value.equals(StringSegment.from(undefined))) {
			return false;
		}

		boolField.set(true);
		return true;
	}

	private static trySetOptionalTokenList(
		nameValue: NameValueHeaderValue,
		boolField: Ref<boolean>,
		destination: Ref<StringSegment[] | undefined>,
	): boolean {
		if (nameValue.value.equals(StringSegment.from(undefined))) {
			boolField.set(true);
			return true;
		}

		// We need the string to be at least 3 chars long: 2x quotes and at least 1 character. Also make sure we
		// have a quoted string. Note that NameValueHeaderValue will never have leading/trailing whitespaces.
		const valueString = nameValue.value;
		if (
			valueString.length < 3 ||
			valueString.at(0) !== '"' ||
			valueString.at(valueString.length - 1) !== '"'
		) {
			return false;
		}

		// We have a quoted string. Now verify that the string contains a list of valid tokens separated by ','.
		let current = 1; // skip the initial '"' character.
		const maxLength = valueString.length - 1; // -1 because we don't want to parse the final '"'.
		const originalValueCount =
			destination.get() === undefined ? 0 : destination.get()!.length;
		while (current < maxLength) {
			let separatorFound = false;
			current = getNextNonEmptyOrWhitespaceIndex(
				valueString,
				current,
				true,
				{
					set: (value) => (separatorFound = value),
				},
			);

			if (current === maxLength) {
				break;
			}

			const tokenLength = getTokenLength(valueString, current);

			if (tokenLength === 0) {
				// We already skipped whitespaces and separators. If we don't have a token it must be an invalid
				// character.
				return false;
			}

			if (destination.get() === undefined) {
				destination.set([] /* TODO: ObjectCollection<StringSegment> */);
			}

			destination
				.get()!
				.push(valueString.subsegment(current, tokenLength));

			current = current + tokenLength;
		}

		// After parsing a valid token list, we expect to have at least one value
		if (
			destination.get() !== undefined &&
			destination.get()!.length > originalValueCount
		) {
			boolField.set(true);
			return true;
		}

		return false;
	}

	private static trySetTimeSpan(
		nameValue: NameValueHeaderValue,
		timeSpan: Ref<TimeSpan | undefined>,
	): boolean {
		if (nameValue.value.equals(StringSegment.from(undefined))) {
			return false;
		}

		let seconds = 0;
		if (
			!tryParseNonNegativeInt32(nameValue.value, {
				set: (value) => (seconds = value),
			})
		) {
			return false;
		}

		timeSpan.set(TimeSpan.fromSeconds(seconds));

		return true;
	}

	private static trySetCacheControlValues(
		cc: CacheControlHeaderValue,
		nameValueList: NameValueHeaderValue[],
	): boolean {
		for (let i = 0; i < nameValueList.length; i++) {
			const nameValue = nameValueList[i];
			const name = nameValue.name;
			let success = true;

			// HACK: goto
			class Default {}
			try {
				switch (name.length) {
					case 6:
						if (
							StringSegment.from(
								CacheControlHeaderValue.publicString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success =
								CacheControlHeaderValue.trySetTokenOnlyValue(
									nameValue,
									{
										get: () => cc._public,
										set: (value) => (cc._public = value),
									},
								);
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					case 7:
						if (
							StringSegment.from(
								CacheControlHeaderValue.maxAgeString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetTimeSpan(nameValue, {
								get: () => cc._maxAge,
								set: (value) => (cc._maxAge = value),
							});
						} else if (
							StringSegment.from(
								CacheControlHeaderValue.privateString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetOptionalTokenList(
								nameValue,
								{
									get: () => cc._private,
									set: (value) => (cc._private = value),
								},
								{
									get: () => cc._privateHeaders,
									set: (value) =>
										(cc._privateHeaders = value),
								},
							);
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					case 8:
						if (
							StringSegment.from(
								CacheControlHeaderValue.noCacheString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetOptionalTokenList(
								nameValue,
								{
									get: () => cc._noCache,
									set: (value) => (cc._noCache = value),
								},
								{
									get: () => cc._noCacheHeaders,
									set: (value) =>
										(cc._noCacheHeaders = value),
								},
							);
						} else if (
							StringSegment.from(
								CacheControlHeaderValue.noStoreString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetTokenOnlyValue(nameValue, {
								get: () => cc._noStore,
								set: (value) => (cc._noStore = value),
							});
						} else if (
							StringSegment.from(
								CacheControlHeaderValue.sharedMaxAgeString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetTimeSpan(nameValue, {
								get: () => cc._sharedMaxAge,
								set: (value) => (cc._sharedMaxAge = value),
							});
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					case 9:
						if (
							StringSegment.from(
								CacheControlHeaderValue.maxStaleString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success =
								nameValue.value.equals(
									StringSegment.from(undefined),
								) ||
								this.trySetTimeSpan(nameValue, {
									get: () => cc._maxStaleLimit,
									set: (value) => (cc._maxStaleLimit = value),
								});
							if (success) {
								cc._maxStale = true;
							}
						} else if (
							StringSegment.from(
								CacheControlHeaderValue.minFreshString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetTimeSpan(nameValue, {
								get: () => cc._minFresh,
								set: (value) => (cc._minFresh = value),
							});
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					case 12:
						if (
							StringSegment.from(
								CacheControlHeaderValue.noTransformString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetTokenOnlyValue(nameValue, {
								get: () => cc._noTransform,
								set: (value) => (cc._noTransform = value),
							});
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					case 14:
						if (
							StringSegment.from(
								CacheControlHeaderValue.onlyIfCachedString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetTokenOnlyValue(nameValue, {
								get: () => cc._onlyIfCached,
								set: (value) => (cc._onlyIfCached = value),
							});
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					case 15:
						if (
							StringSegment.from(
								CacheControlHeaderValue.mustRevalidateString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success = this.trySetTokenOnlyValue(nameValue, {
								get: () => cc._mustRevalidate,
								set: (value) => (cc._mustRevalidate = value),
							});
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					case 16:
						if (
							StringSegment.from(
								CacheControlHeaderValue.proxyRevalidateString,
							)
								.toLowerCase()
								.equals(name.toLowerCase())
						) {
							success =
								CacheControlHeaderValue.trySetTokenOnlyValue(
									nameValue,
									{
										get: () => cc._proxyRevalidate,
										set: (value) =>
											(cc._proxyRevalidate = value),
									},
								);
						} else {
							// HACK: goto
							throw new Default();
						}
						break;

					default:
						// HACK: goto
						throw new Default();
				}
			} catch (error) {
				if (error instanceof Default) {
					cc.extensions.push(nameValue); // success is always true
				} else {
					throw error;
				}
			}

			if (!success) {
				return false;
			}
		}

		return true;
	}

	private static getCacheControlLength = (
		input: StringSegment,
		startIndex: number,
		parsedValue: Out<CacheControlHeaderValue | undefined>,
	): number => {
		if (startIndex < 0) {
			throw new Error('Assertion failed.');
		}

		parsedValue.set(undefined);

		if (StringSegment.isNullOrEmpty(input) || startIndex >= input.length) {
			return 0;
		}

		// Cache-Control header consists of a list of name/value pairs, where the value is optional. So use an
		// instance of NameValueHeaderParser to parse the string.
		let current = startIndex;
		const nameValueList: NameValueHeaderValue[] = [];
		while (current < input.length) {
			let nameValue: NameValueHeaderValue | undefined;
			if (
				!NameValueHeaderValue.multipleValueParser.tryParseValue(
					input,
					{
						get: () => current,
						set: (value) => (current = value),
					},
					{
						set: (value) => (nameValue = value),
					},
				)
			) {
				return 0;
			}

			if (nameValue !== undefined) {
				nameValueList.push(nameValue);
			}
		}

		// If we get here, we were able to successfully parse the string as list of name/value pairs. Now analyze
		// the name/value pairs.
		const result = new CacheControlHeaderValue();

		if (
			!CacheControlHeaderValue.trySetCacheControlValues(
				result,
				nameValueList,
			)
		) {
			return 0;
		}

		parsedValue.set(result);

		// If we get here we successfully parsed the whole string.
		return input.length - startIndex;
	};

	private static readonly parser: HttpHeaderParser<CacheControlHeaderValue> =
		new GenericHeaderParser<CacheControlHeaderValue>(
			true,
			CacheControlHeaderValue.getCacheControlLength,
		);

	/**
	 * Parses <paramref name="input"/> as a {@link CacheControlHeaderValue} value.
	 * @param input The values to parse.
	 * @returns The parsed values.
	 */
	static parse(input: StringSegment): CacheControlHeaderValue {
		let index = 0;
		// Cache-Control is unusual because there are no required values so the parser will succeed for an empty string, but still return null.
		const result = CacheControlHeaderValue.parser.parseValue(input, {
			get: () => index,
			set: (value) => (index = value),
		});
		if (result === undefined) {
			throw new Error('No cache directives found.');
		}
		return result;
	}

	static tryParse(
		input: StringSegment,
		parsedValue: Out<CacheControlHeaderValue | undefined>,
	): boolean {
		let index = 0;
		// Cache-Control is unusual because there are no required values so the parser will succeed for an empty string, but still return null.
		let result: CacheControlHeaderValue | undefined;
		if (
			CacheControlHeaderValue.parser.tryParseValue(
				input,
				{
					get: () => index,
					set: (value) => (index = value),
				},
				{
					set: (value) => (result = value),
				},
			) &&
			result !== undefined
		) {
			parsedValue.set(result);
			return true;
		}
		parsedValue.set(undefined);
		return false;
	}
}
