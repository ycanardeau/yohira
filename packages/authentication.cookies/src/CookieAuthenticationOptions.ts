import {
	AuthenticationSchemeOptions,
	ISecureDataFormat,
	RequestPathBaseCookieBuilder,
} from '@yohira/authentication';
import { AuthenticationTicket } from '@yohira/authentication.abstractions';
import { CookieBuilder, CookieSecurePolicy } from '@yohira/http.abstractions';
import { SameSiteMode } from '@yohira/http.features';

import { ICookieManager } from './ICookieManager';
import { ITicketStore } from './ITicketStore';

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

	/**
	 * The TicketDataFormat is used to protect and unprotect the identity and other properties which are stored in the
	 * cookie value. If not provided one will be created using {@link DataProtectionProvider}.
	 */
	ticketDataFormat!: ISecureDataFormat<AuthenticationTicket>;

	/**
	 * The component used to get cookies from the request or set them on the response.
	 *
	 * ChunkingCookieManager will be used by default.
	 */
	cookieManager!: ICookieManager;

	/**
	 * An optional container in which to store the identity across requests. When used, only a session identifier is sent
	 * to the client. This can be used to mitigate potential problems with very large identities.
	 */
	sessionStore: ITicketStore | undefined;
}
