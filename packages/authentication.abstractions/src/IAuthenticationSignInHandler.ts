// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationSignInHandler.cs,a9056d902606583b,references
import { AuthenticationProperties } from './AuthenticationProperties';
import { ClaimsPrincipal } from './ClaimsPrincipal';
import { IAuthenticationSignOutHandler } from './IAuthenticationSignOutHandler';

/**
 * Used to determine if a handler supports SignIn.
 */
export interface IAuthenticationSignInHandler
	extends IAuthenticationSignOutHandler {
	/**
	 * Handle sign in.
	 * @param user The {@link ClaimsPrincipal} user.
	 * @param properties The {@link AuthenticationProperties} that contains the extra meta-data arriving with the authentication.
	 * @returns A promise.
	 */
	signIn(
		user: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void>;
}
