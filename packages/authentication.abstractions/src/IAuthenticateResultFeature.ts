import { AuthenticateResult } from './AuthenticateResult';

export const IAuthenticateResultFeature = Symbol.for(
	'IAuthenticateResultFeature',
);
// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticateResultFeature.cs,c623b6509bba16c6,references
/**
 * Used to capture the {@link AuthenticateResult} from the authorization middleware.
 */
export interface IAuthenticateResultFeature {
	/**
	 * The {@link AuthenticateResult} from the authorization middleware.
	 * Set to null if the {@link IHttpAuthenticationFeature.user} property is set after the authorization middleware.
	 */
	authenticateResult: AuthenticateResult | undefined;
}
