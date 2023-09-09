import { TimeSpan } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';
import { SetCookieHeaderValue } from '@yohira/http.headers';

import { SameSiteMode } from './SameSiteMode';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/CookieOptions.cs,14d3cbcab9624444,references
export class CookieOptions {
	private _extensions: string[] | undefined;

	domain?: string;
	path?: string;
	expires?: number /* REVIEW */;
	secure = false;
	sameSite = SameSiteMode.Unspecified;
	httpOnly = false;
	maxAge?: TimeSpan;
	isEssential = false;

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
