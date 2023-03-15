import { SameSiteMode } from '@yohira/http.features';

import { CookieSecurePolicy } from './CookieSecurePolicy';

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
}
