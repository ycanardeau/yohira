import {
	AuthenticationSchemeOptions,
	RequestPathBaseCookieBuilder,
} from '@yohira/authentication';
import { CookieBuilder, CookieSecurePolicy } from '@yohira/http.abstractions';
import { SameSiteMode } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieAuthenticationOptions.cs,76a6af7c2f3872a2,references
/**
 * Configuration options for {@link CookieAuthenticationOptions}.
 */
export class CookieAuthenticationOptions extends AuthenticationSchemeOptions {
	private cookieBuilder = ((): RequestPathBaseCookieBuilder => {
		const cookieBuilder = new RequestPathBaseCookieBuilder();

		// the default name is configured in PostConfigureCookieAuthenticationOptions

		// To support OAuth authentication, a lax mode is required, see https://github.com/aspnet/Security/issues/1231.
		cookieBuilder.sameSite = SameSiteMode.Lax;
		cookieBuilder.httpOnly = true;
		cookieBuilder.securePolicy = CookieSecurePolicy.SameAsRequest;
		cookieBuilder.isEssential = true;
		return cookieBuilder;
	})();

	get cookie(): CookieBuilder {
		return this.cookieBuilder;
	}
	set cookie(value: CookieBuilder) {
		this.cookieBuilder = value;
	}
}
