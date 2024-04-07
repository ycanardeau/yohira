import { Ref, StringBuilder, TimeSpan } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

import { checkNameFormat, checkValueFormat } from './CookieHeaderValue';
import { formatInt64 } from './HeaderUtilities';
import { SameSiteMode } from './SameSiteMode';

// https://source.dot.net/#Microsoft.Net.Http.Headers/SetCookieHeaderValue.cs,ad427ca3560e8900,references
/**
 * Represents the <c>Set-Cookie</c> header.
 */
export class SetCookieHeaderValue {
	private static readonly expiresToken = 'expires';
	private static readonly maxAgeToken = 'max-age';
	private static readonly domainToken = 'domain';
	private static readonly pathToken = 'path';
	private static readonly secureToken = 'secure';
	// RFC Draft: https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00
	private static readonly sameSiteToken = 'samesite';
	private static readonly sameSiteNoneToken =
		SameSiteMode[SameSiteMode.None].toLowerCase();
	private static readonly sameSiteLaxToken =
		SameSiteMode[SameSiteMode.Lax].toLowerCase();
	private static readonly sameSiteStrictToken =
		SameSiteMode[SameSiteMode.Strict].toLowerCase();

	private static readonly httpOnlyToken = 'httponly';
	private static readonly separatorToken = '; ';
	private static readonly equalsToken = '=';
	private static readonly expiresDateLength = 29;
	private static readonly expiresDateFormat = 'r';

	private _name!: StringSegment;
	/**
	 * Gets or sets the cookie name.
	 */
	get name(): StringSegment {
		return this._name;
	}
	set name(value: StringSegment) {
		checkNameFormat(value, 'value');
		this._name = value;
	}

	private _value!: StringSegment;
	/**
	 * Gets or sets the cookie value.
	 */
	get value(): StringSegment {
		return this._value;
	}
	set value(value: StringSegment) {
		checkValueFormat(value, 'value');
		this._value = value;
	}

	expires: number | undefined;
	maxAge: TimeSpan | undefined;
	domain = StringSegment.from(undefined);
	path = StringSegment.from(undefined);
	secure = false;
	sameSite = SameSiteMode.Unspecified;
	httpOnly = false;

	private _extensions: StringSegment[] | undefined;
	get extensions(): StringSegment[] {
		return (this._extensions ??= []);
	}

	constructor(name: StringSegment, value = StringSegment.empty()) {
		this.name = name;
		this.value = value;
	}

	private static append(
		span: Ref<string>,
		other: string | StringSegment,
	): void {
		span.set(
			span.get() + (typeof other === 'string' ? other : other.value),
		);
	}

	private static appendSegment(
		span: Ref<string>,
		name: StringSegment,
		value: StringSegment,
	): void {
		SetCookieHeaderValue.append(span, SetCookieHeaderValue.separatorToken);
		SetCookieHeaderValue.append(span, name);
		if (!value.equals(StringSegment.from(undefined))) {
			SetCookieHeaderValue.append(span, SetCookieHeaderValue.equalsToken);
			SetCookieHeaderValue.append(span, value);
		}
	}

	// name="value"; expires=Sun, 06 Nov 1994 08:49:37 GMT; max-age=86400; domain=domain1; path=path1; secure; samesite={strict|lax|none}; httponly
	toString(): string {
		let length =
			this._name.length +
			SetCookieHeaderValue.equalsToken.length +
			this._value.length;

		let maxAge: string | undefined;
		let sameSite: string | undefined;

		if (this.expires !== undefined) {
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.expiresToken.length +
				SetCookieHeaderValue.equalsToken.length +
				SetCookieHeaderValue.expiresDateLength;
		}

		if (this.maxAge !== undefined) {
			maxAge = formatInt64(this.maxAge.totalSeconds);
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.maxAgeToken.length +
				SetCookieHeaderValue.equalsToken.length +
				maxAge.length;
		}

		if (!this.domain.equals(StringSegment.from(undefined))) {
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.domainToken.length +
				SetCookieHeaderValue.equalsToken.length +
				this.domain.length;
		}

		if (!this.path.equals(StringSegment.from(undefined))) {
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.pathToken.length +
				SetCookieHeaderValue.equalsToken.length +
				this.path.length;
		}

		if (this.secure) {
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.secureToken.length;
		}

		// Allow for Unspecified (-1) to skip SameSite
		if (this.sameSite === SameSiteMode.None) {
			sameSite = SetCookieHeaderValue.sameSiteNoneToken;
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.sameSiteToken.length +
				SetCookieHeaderValue.equalsToken.length +
				sameSite.length;
		} else if (this.sameSite === SameSiteMode.Lax) {
			sameSite = SetCookieHeaderValue.sameSiteLaxToken;
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.sameSiteToken.length +
				SetCookieHeaderValue.equalsToken.length +
				sameSite.length;
		} else if (this.sameSite === SameSiteMode.Strict) {
			sameSite = SetCookieHeaderValue.sameSiteStrictToken;
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.sameSiteToken.length +
				SetCookieHeaderValue.equalsToken.length +
				sameSite.length;
		}

		if (this.httpOnly) {
			length +=
				SetCookieHeaderValue.separatorToken.length +
				SetCookieHeaderValue.httpOnlyToken.length;
		}

		if (this._extensions !== undefined && this._extensions.length > 0) {
			for (const extension of this._extensions) {
				length +=
					SetCookieHeaderValue.separatorToken.length +
					extension.length;
			}
		}

		return ((): string => {
			let span = '';
			const spanRef = {
				get: () => span,
				set: (value: string) => (span = value),
			};

			const [headerValue, maxAgeValue] = [this, maxAge];

			SetCookieHeaderValue.append(spanRef, headerValue._name);
			SetCookieHeaderValue.append(
				spanRef,
				SetCookieHeaderValue.equalsToken,
			);
			SetCookieHeaderValue.append(spanRef, headerValue._value);

			if (headerValue.expires !== undefined) {
				SetCookieHeaderValue.append(
					spanRef,
					SetCookieHeaderValue.separatorToken,
				);
				SetCookieHeaderValue.append(
					spanRef,
					SetCookieHeaderValue.expiresToken,
				);
				SetCookieHeaderValue.append(
					spanRef,
					SetCookieHeaderValue.equalsToken,
				);

				spanRef.set(
					spanRef.get() + new Date(headerValue.expires).toUTCString(),
				);
			}

			if (maxAgeValue !== undefined) {
				SetCookieHeaderValue.appendSegment(
					spanRef,
					StringSegment.from(SetCookieHeaderValue.maxAgeToken),
					StringSegment.from(maxAgeValue),
				);
			}

			if (!headerValue.domain.equals(StringSegment.from(undefined))) {
				SetCookieHeaderValue.appendSegment(
					spanRef,
					StringSegment.from(SetCookieHeaderValue.domainToken),
					headerValue.domain,
				);
			}

			if (!headerValue.path.equals(StringSegment.from(undefined))) {
				SetCookieHeaderValue.appendSegment(
					spanRef,
					StringSegment.from(SetCookieHeaderValue.pathToken),
					headerValue.path,
				);
			}

			if (headerValue.secure) {
				SetCookieHeaderValue.appendSegment(
					spanRef,
					StringSegment.from(SetCookieHeaderValue.secureToken),
					StringSegment.from(undefined),
				);
			}

			if (sameSite !== undefined) {
				SetCookieHeaderValue.appendSegment(
					spanRef,
					StringSegment.from(SetCookieHeaderValue.sameSiteToken),
					StringSegment.from(sameSite),
				);
			}

			if (headerValue.httpOnly) {
				SetCookieHeaderValue.appendSegment(
					spanRef,
					StringSegment.from(SetCookieHeaderValue.httpOnlyToken),
					StringSegment.from(undefined),
				);
			}

			if (this._extensions !== undefined && this._extensions.length > 0) {
				for (const extension of this._extensions) {
					SetCookieHeaderValue.appendSegment(
						spanRef,
						extension,
						StringSegment.from(undefined),
					);
				}
			}

			return span;
		})();
	}

	appendToStringBuilder(builder: StringBuilder): void {
		builder.appendString(this.toString());
	}
}
