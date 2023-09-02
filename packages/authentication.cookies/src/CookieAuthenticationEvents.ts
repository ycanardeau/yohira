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
	 * Invoked to validate the principal.
	 * @param context The {@link CookieValidatePrincipalContext}.
	 */
	validatePrincipal(context: CookieValidatePrincipalContext): Promise<void> {
		return this.onValidatePrincipal(context);
	}
}
