import { AuthenticationProperties } from './AuthenticationProperties';
import { IAuthenticationHandler } from './IAuthenticationHandler';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationSignOutHandler.cs,22fb2478f2d643a8,references
/**
 * Used to determine if a handler supports SignOut.
 */
export interface IAuthenticationSignOutHandler extends IAuthenticationHandler {
	/**
	 * Signout behavior.
	 * @param properties The {@link AuthenticationProperties} that contains the extra meta-data arriving with the authentication.
	 * @returns A promise.
	 */
	signOut(properties: AuthenticationProperties | undefined): Promise<void>;
}
