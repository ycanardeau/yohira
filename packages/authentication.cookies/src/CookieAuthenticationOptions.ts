import {
	AuthenticationSchemeOptions,
	ISecureDataFormat,
	RequestPathBaseCookieBuilder,
} from '@yohira/authentication';
import { AuthenticationTicket } from '@yohira/authentication.abstractions';
import { IDataProtectionProvider } from '@yohira/data-protection.abstractions';
import {
	CookieBuilder,
	CookieSecurePolicy,
	PathString,
} from '@yohira/http.abstractions';
import { SameSiteMode } from '@yohira/http.features';

import { CookieAuthenticationDefaults } from './CookieAuthenticationDefaults';
import { CookieAuthenticationEvents } from './CookieAuthenticationEvents';
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
	 * If set this will be used by the CookieAuthenticationHandler for data protection.
	 */
	dataProtectionProvider: IDataProtectionProvider | undefined;

	/**
	 * The slidingExpiration is set to true to instruct the handler to re-issue a new cookie with a new
	 * expiration time any time it processes a request which is more than halfway through the expiration window.
	 */
	slidingExpiration: boolean;

	/**
	 * The LoginPath property is used by the handler for the redirection target when handling ChallengeAsync.
	 * The current url which is added to the LoginPath as a query string parameter named by the ReturnUrlParameter.
	 * Once a request to the LoginPath grants a new SignIn identity, the ReturnUrlParameter value is used to redirect
	 * the browser back to the original url.
	 */
	loginPath!: PathString;

	/**
	 * The ReturnUrlParameter determines the name of the query string parameter which is appended by the handler
	 * during a Challenge. This is also the query string parameter looked for when a request arrives on the login
	 * path or logout path, in order to return to the original url after the action is performed.
	 */
	returnUrlParameter: string;

	get events(): CookieAuthenticationEvents {
		return super.events as CookieAuthenticationEvents;
	}
	set events(value: CookieAuthenticationEvents) {
		super.events = value;
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

	expireTimeSpan: number;

	constructor() {
		super();

		this.expireTimeSpan = 60 * 1000 * 60 * 24 * 14;
		this.returnUrlParameter =
			CookieAuthenticationDefaults.returnUrlParameter;
		this.slidingExpiration = true;
		this.events = new CookieAuthenticationEvents();
	}
}
