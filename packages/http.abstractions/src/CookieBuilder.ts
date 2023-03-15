import { CookieOptions, SameSiteMode } from '@yohira/http.features';

import { CookieSecurePolicy } from './CookieSecurePolicy';
import { IHttpContext } from './IHttpContext';

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
	// TODO: expiration;
	// TODO: maxAge;
	isEssential = false;

	build(context: IHttpContext, expiresFrom = new Date()): CookieOptions {
		// TODO
		throw new Error('Method not implemented.');
	}
}
