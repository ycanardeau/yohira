import { ClaimsPrincipal } from './ClaimsPrincipal';
import { IAuthenticationService } from './IAuthenticationService';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationOptions.cs,4dc8a87f8f469dfd,references
/**
 * Options to configure authentication.
 */
export class AuthenticationOptions {
	/**
	 * Used as the fallback default scheme for all the other defaults.
	 */
	defaultScheme?: string;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.authenticateAsync}.
	 */
	defaultAuthenticateScheme?: string;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.signInAsync}.
	 */
	defaultSignInScheme?: string;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.signOutAsync}.
	 */
	defaultSignOutScheme?: string;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.challengeAsync}.
	 */
	defaultChallengeScheme?: string;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.forbidAsync}.
	 */
	defaultForbidScheme?: string;
	/**
	 * If true, SignIn should throw if attempted with a user is not authenticated.
	 * A user is considered authenticated if {@link ClaimsIdentity.isAuthenticated} returns true for the {@link ClaimsPrincipal} associated with the HTTP request.
	 */
	requireAuthenticatedSignIn = true;
}
