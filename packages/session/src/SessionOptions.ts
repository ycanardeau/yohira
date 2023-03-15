import { CookieBuilder, CookieSecurePolicy } from '@yohira/http.abstractions';
import { SameSiteMode } from '@yohira/http.features';

import { SessionDefaults } from './SessionDefaults';

// https://source.dot.net/#Microsoft.AspNetCore.Session/SessionOptions.cs,83b1d37893a6579f,references
class SessionCookieBuilder extends CookieBuilder {
	// TODO: expiration;

	constructor() {
		super();

		this.name = SessionDefaults.cookieName;
		this.path = SessionDefaults.cookiePath;
		this.securePolicy = CookieSecurePolicy.None;
		this.sameSite = SameSiteMode.Lax;
		this.httpOnly = true;
		// Session is considered non-essential as it's designed for ephemeral data.
		this.isEssential = false;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Session/SessionOptions.cs,3bf6a68a28d969e1,references
export class SessionOptions {
	cookie = new SessionCookieBuilder();
}
