import { CookieBuilder, CookieSecurePolicy } from '@yohira/http.abstractions';
import { SameSiteMode } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/AntiforgeryOptions.cs,21f0d65fa390f452,references
/**
 * Provides programmatic configuration for the antiforgery token system.
 */
export class AntiforgeryOptions {
	private static readonly antiforgeryTokenFieldName =
		'__RequestVerificationToken';
	private static readonly antiforgeryTokenHeaderName =
		'RequestVerificationToken';

	private _formFieldName = AntiforgeryOptions.antiforgeryTokenFieldName;

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

	/**
	 * Specifies the name of the antiforgery token field that is used by the antiforgery system.
	 */
	get formFieldName(): string {
		return this._formFieldName;
	}
	set formFieldName(value: string) {
		this._formFieldName = value;
	}

	/**
	 * Specifies the name of the header value that is used by the antiforgery system. If <c>null</c> then
	 * antiforgery validation will only consider form data.
	 */
	headerName: string | undefined =
		AntiforgeryOptions.antiforgeryTokenHeaderName;

	/**
	 * Specifies whether to suppress the generation of X-Frame-Options header
	 * which is used to prevent ClickJacking. By default, the X-Frame-Options
	 * header is generated with the value SAMEORIGIN. If this setting is 'true',
	 * the X-Frame-Options header will not be generated for the response.
	 */
	suppressXFrameOptionsHeader = false;
}
