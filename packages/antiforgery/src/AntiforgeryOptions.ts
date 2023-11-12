import { CookieBuilder, CookieSecurePolicy } from '@yohira/http.abstractions';
import { SameSiteMode } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/AntiforgeryOptions.cs,21f0d65fa390f452,references
/**
 * Provides programmatic configuration for the antiforgery token system.
 */
export class AntiforgeryOptions {
	private _cookieBuilder = ((): CookieBuilder => {
		const cookieBuilder = new CookieBuilder();

		cookieBuilder.sameSite = SameSiteMode.Strict;
		cookieBuilder.httpOnly = true;

		// Check the comment on CookieBuilder for more details
		cookieBuilder.isEssential = true;

		// Some browsers do not allow non-secure endpoints to set cookies with a 'secure' flag or overwrite cookies
		// whose 'secure' flag is set (http://httpwg.org/http-extensions/draft-ietf-httpbis-cookie-alone.html).
		// Since mixing secure and non-secure endpoints is a common scenario in applications, we are relaxing the
		// restriction on secure policy on some cookies by setting to 'None'. Cookies related to authentication or
		// authorization use a stronger policy than 'None'.
		cookieBuilder.securePolicy = CookieSecurePolicy.None;

		return cookieBuilder;
	})();

	/**
	 * The default cookie prefix, which is ".yohira.antiforgery.".
	 */
	static readonly defaultCookiePrefix = '.yohira.antiforgery.';

	get cookie(): CookieBuilder {
		return this._cookieBuilder;
	}
	set cookie(value: CookieBuilder) {
		this._cookieBuilder = value;
	}
}
