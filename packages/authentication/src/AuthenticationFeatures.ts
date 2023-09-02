import {
	AuthenticateResult,
	ClaimsPrincipal,
	IAuthenticateResultFeature,
} from '@yohira/authentication.abstractions';
import { IHttpAuthenticationFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationFeatures.cs,1db42f435e0aece7,references
/**
 * Keeps the User and AuthenticationResult consistent with each other
 */
export class AuthenticationFeatures
	implements IAuthenticateResultFeature, IHttpAuthenticationFeature
{
	private _user?: ClaimsPrincipal;
	private result?: AuthenticateResult;

	constructor(result: AuthenticateResult) {
		this.authenticateResult = result;
	}

	get authenticateResult(): AuthenticateResult | undefined {
		return this.result;
	}
	set authenticateResult(value: AuthenticateResult | undefined) {
		this.result = value;
	}

	get user(): ClaimsPrincipal | undefined {
		return this._user;
	}
	set user(value: ClaimsPrincipal | undefined) {
		this._user = value;
		this.result = undefined;
	}
}
