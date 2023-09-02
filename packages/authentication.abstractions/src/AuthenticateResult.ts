import { AuthenticationProperties } from './AuthenticationProperties';
import { AuthenticationTicket } from './AuthenticationTicket';
import { ClaimsPrincipal } from './ClaimsPrincipal';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticateResult.cs,b5dbe684bca93171,references
/**
 * Contains the result of an Authenticate call
 */
export class AuthenticateResult {
	private static readonly _noResult = ((): AuthenticateResult => {
		const result = new AuthenticateResult();
		result.none = true;
		return result;
	})();

	private _ticket: AuthenticationTicket | undefined;
	get ticket(): AuthenticationTicket | undefined {
		return this._ticket;
	}
	protected set ticket(value: AuthenticationTicket | undefined) {
		this._ticket = value;
	}

	/**
	 * If a ticket was produced, authenticate was successful.
	 */
	get succeeded(): boolean {
		return this.ticket !== undefined;
	}

	/**
	 * Gets the claims-principal with authenticated user identities.
	 */
	get principal(): ClaimsPrincipal | undefined {
		return this.ticket?.principal;
	}

	/**
	 * Additional state values for the authentication session.
	 */
	properties?: AuthenticationProperties;

	private _failure: Error | undefined;
	/**
	 * Holds failure information from the authentication.
	 */
	get failure(): Error | undefined {
		return this._failure;
	}
	protected set failure(value: Error | undefined) {
		this._failure = value;
	}

	private _none = false;
	/**
	 * Indicates that there was no information returned for this authentication scheme.
	 */
	get none(): boolean {
		return this._none;
	}
	protected set none(value: boolean) {
		this._none = value;
	}

	/**
	 * Indicates that authentication was successful.
	 * @param ticket The ticket representing the authentication result.
	 * @returns The result.
	 */
	static success(ticket: AuthenticationTicket): AuthenticateResult {
		const result = new AuthenticateResult();
		result.ticket = ticket;
		result.properties = ticket.properties;
		return result;
	}

	/**
	 * Indicates that there was no information returned for this authentication scheme.
	 * @returns The result.
	 */
	static noResult(): AuthenticateResult {
		return AuthenticateResult._noResult;
	}
}
