import { AuthenticationSchemeBuilder } from './AuthenticationSchemeBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationOptions.cs,4dc8a87f8f469dfd,references
/**
 * Options to configure authentication.
 */
export class AuthenticationOptions {
	private readonly _schemes: AuthenticationSchemeBuilder[] = [];

	readonly schemeMap = new Map<string, AuthenticationSchemeBuilder>();

	/**
	 * Used as the fallback default scheme for all the other defaults.
	 */
	defaultScheme: string | undefined;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.authenticate}.
	 */
	defaultAuthenticateScheme: string | undefined;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.signIn}.
	 */
	defaultSignInScheme: string | undefined;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.signOut}.
	 */
	defaultSignOutScheme: string | undefined;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.challenge}.
	 */
	defaultChallengeScheme: string | undefined;
	/**
	 * Used as the default scheme by {@link IAuthenticationService.forbid}.
	 */
	defaultForbidScheme: string | undefined;
	/**
	 * If true, SignIn should throw if attempted with a user is not authenticated.
	 * A user is considered authenticated if {@link ClaimsIdentity.isAuthenticated} returns true for the {@link ClaimsPrincipal} associated with the HTTP request.
	 */
	requireAuthenticatedSignIn = true;

	get schemes(): readonly AuthenticationSchemeBuilder[] {
		return this._schemes;
	}

	addScheme(
		name: string,
		configureBuilder: (builder: AuthenticationSchemeBuilder) => void,
	): void {
		if (this.schemeMap.has(name)) {
			throw new Error(`Scheme already exists: ${name}`);
		}

		const builder = new AuthenticationSchemeBuilder(name);
		configureBuilder(builder);
		this._schemes.push(builder);
		this.schemeMap.set(name, builder);
	}
}
