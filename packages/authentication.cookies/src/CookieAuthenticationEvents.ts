import { RedirectContext } from '@yohira/authentication';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';
import { CookieSignedInContext } from './CookieSignedInContext';
import { CookieSigningInContext } from './CookieSigningInContext';
import { CookieSigningOutContext } from './CookieSigningOutContext';
import { CookieSlidingExpirationContext } from './CookieSlidingExpirationContext';
import { CookieValidatePrincipalContext } from './CookieValidatePrincipalContext';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieAuthenticationEvents.cs,8ff04a0cd46d7a23,references
/**
 * Allows subscribing to events raised during cookie authentication.
 */
export class CookieAuthenticationEvents {
	/**
	 * Invoked to validate the principal.
	 */
	onValidatePrincipal = (
		context: CookieValidatePrincipalContext,
	): Promise<void> => Promise.resolve();

	/**
	 * Invoked to check if the cookie should be renewed.
	 */
	onCheckSlidingExpiration = (
		context: CookieSlidingExpirationContext,
	): Promise<void> => Promise.resolve();

	/**
	 * Invoked on signing in.
	 */
	onSigningIn = (context: CookieSigningInContext): Promise<void> =>
		Promise.resolve();

	/**
	 * Invoked after sign in has completed.
	 */
	onSignedIn = (context: CookieSignedInContext): Promise<void> =>
		Promise.resolve();

	/**
	 * Invoked on signing out.
	 */
	onSigningOut = (context: CookieSigningOutContext): Promise<void> =>
		Promise.resolve();

	onRedirectToReturnUrl = (
		context: RedirectContext<CookieAuthenticationOptions>,
	): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};

	/**
	 * Invoked to validate the principal.
	 * @param context The {@link CookieValidatePrincipalContext}.
	 */
	validatePrincipal(context: CookieValidatePrincipalContext): Promise<void> {
		return this.onValidatePrincipal(context);
	}

	/**
	 * Invoked to check if the cookie should be renewed.
	 */
	checkSlidingExpiration(
		context: CookieSlidingExpirationContext,
	): Promise<void> {
		return this.onCheckSlidingExpiration(context);
	}

	/**
	 * Invoked during sign in.
	 * @param context The {@link CookieSigningInContext}.
	 */
	signingIn(context: CookieSigningInContext): Promise<void> {
		return this.onSigningIn(context);
	}

	/**
	 * Invoked after sign in has completed.
	 * @param context The {@link CookieSignedInContext}.
	 */
	signedIn(context: CookieSignedInContext): Promise<void> {
		return this.onSignedIn(context);
	}

	/**
	 * Invoked on sign out.
	 * @param context {@link CookieSigningOutContext}.
	 */
	signingOut(context: CookieSigningOutContext): Promise<void> {
		return this.onSigningOut(context);
	}

	/**
	 * Invoked when the client is being redirected after log out.
	 */
	redirectToReturnUrl(
		context: RedirectContext<CookieAuthenticationOptions>,
	): Promise<void> {
		return this.onRedirectToReturnUrl(context);
	}
}
