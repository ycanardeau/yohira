import { CookieOptions, SameSiteMode } from '@yohira/http.features';

import { CookieSecurePolicy } from './CookieSecurePolicy';
import { IHttpContext } from './IHttpContext';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/CookieBuilder.cs,5b5d0a5eed7b3250,references
/**
 * Defines settings used to create a cookie.
 */
export class CookieBuilder {
	private _name?: string;

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

	build(context: IHttpContext, expiresFrom = new Date()): CookieOptions {
		// TODO
		throw new Error('Method not implemented.');
	}
}
