import { TimeSpan } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';
import { SetCookieHeaderValue } from '@yohira/http.headers';

import { SameSiteMode } from './SameSiteMode';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/CookieOptions.cs,14d3cbcab9624444,references
export class CookieOptions {
	private constructor(
		public domain: string | undefined,
		public path: string | undefined,
		public expires: number /* REVIEW */ | undefined,
		public secure: boolean,
		public sameSite: SameSiteMode,
		public httpOnly: boolean,
		public maxAge: TimeSpan | undefined,
		public isEssential: boolean,
		private _extensions: string[] | undefined,
	) {}

	static create(): CookieOptions {
		return new CookieOptions(
			undefined,
			'/',
			undefined,
			false,
			SameSiteMode.Unspecified,
			false,
			undefined,
			false,
			undefined,
		);
	}

	static fromOptions(options: CookieOptions): CookieOptions {
		return new CookieOptions(
			options.domain,
			options.path,
			options.expires,
			options.secure,
			options.sameSite,
			options.httpOnly,
			options.maxAge,
			options.isEssential,
			options._extensions !== undefined && options._extensions.length > 0
				? [...options._extensions]
				: undefined,
		);
	}

	/**
	 * Gets a collection of additional values to append to the cookie.
	 */
	get extensions(): string[] {
		return (this._extensions ??= []);
	}

	createCookieHeader(name: string, value: string): SetCookieHeaderValue {
		const cookie = new SetCookieHeaderValue(
			StringSegment.from(name),
			StringSegment.from(value),
		);
		cookie.domain = StringSegment.from(this.domain);
		cookie.path = StringSegment.from(this.path);
		cookie.expires = this.expires;
		cookie.secure = this.secure;
		cookie.httpOnly = this.httpOnly;
		cookie.maxAge = this.maxAge;
		cookie.sameSite = this.sameSite;

		if (this._extensions !== undefined && this._extensions.length > 0) {
			for (const extension of this._extensions) {
				cookie.extensions.push(StringSegment.from(extension));
			}
		}

		return cookie;
	}
}
