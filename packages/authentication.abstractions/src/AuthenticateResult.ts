import { AuthenticationProperties } from './AuthenticationProperties';
import { ClaimsPrincipal } from './ClaimsPrincipal';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticateResult.cs,b5dbe684bca93171,references
/**
 * Contains the result of an Authenticate call
 */
export class AuthenticateResult {
	/**
	 * If a ticket was produced, authenticate was successful.
	 */
	get succeeded(): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}

	/**
	 * Gets the claims-principal with authenticated user identities.
	 */
	get principal(): ClaimsPrincipal | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	/**
	 * Additional state values for the authentication session.
	 */
	properties?: AuthenticationProperties;
}
