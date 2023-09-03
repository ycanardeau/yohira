import { CookieOptions, SameSiteMode } from '@yohira/http.features';

import { CookieSecurePolicy } from './CookieSecurePolicy';
import { IHttpContext } from './IHttpContext';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/CookieBuilder.cs,5b5d0a5eed7b3250,references
/**
 * Defines settings used to create a cookie.
 */
export class CookieBuilder {
	private _name?: string;
	private extensions: string[] | undefined;

	/**
	 * The name of the cookie.
	 */
	get name(): string | undefined {
		return this._name;
	}
	set name(value: string | undefined) {
		if (!value) {
			throw new Error('Argument cannot be null or empty.' /* LOC */);
		}

		this._name = value;
	}

	path?: string;
	domain?: string;
	httpOnly = false;
	sameSite = SameSiteMode.Unspecified;
	securePolicy = CookieSecurePolicy.SameAsRequest;
	expiration?: number /* TODO: TimeSpan */;
	maxAge?: number /* TODO: TimeSpan */;
	isEssential = false;

	build(
		context: IHttpContext,
		expiresFrom = new Date().getTime(),
	): CookieOptions {
		const options = new CookieOptions();
		options.path = this.path ?? '/';
		options.sameSite = this.sameSite;
		options.httpOnly = this.httpOnly;
		options.maxAge = this.maxAge;
		options.domain = this.domain;
		options.isEssential = this.isEssential;
		options.secure =
			this.securePolicy === CookieSecurePolicy.Always ||
			(this.securePolicy === CookieSecurePolicy.SameAsRequest &&
				context.request.isHttps);
		options.expires =
			this.expiration !== undefined
				? expiresFrom + this.expiration
				: undefined;

		if (this.extensions !== undefined && this.extensions.length > 0) {
			for (const extension of this.extensions) {
				options.extensions.push(extension);
			}
		}
		return options;
	}
}
