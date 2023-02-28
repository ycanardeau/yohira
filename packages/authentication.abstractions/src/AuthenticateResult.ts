import { AuthenticationProperties } from './AuthenticationProperties';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticateResult.cs,b5dbe684bca93171,references
/**
 * Contains the result of an Authenticate call
 */
export class AuthenticateResult {
	/**
	 * Additional state values for the authentication session.
	 */
	properties?: AuthenticationProperties;
}
