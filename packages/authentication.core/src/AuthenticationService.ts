import {
	AuthenticateResult,
	AuthenticationProperties,
	ClaimsPrincipal,
	IAuthenticationService,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationService.cs,30159f972b8c22ae,references
/**
 * Implements {@link IAuthenticationService}.
 */
export class AuthenticationService implements IAuthenticationService {
	authenticateAsync(
		context: IHttpContext,
		scheme: string | undefined,
	): Promise<AuthenticateResult> {
		// TODO
		throw new Error('Method not implemented.');
	}

	challengeAsync(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	forbidAsync(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	signInAsync(
		context: IHttpContext,
		scheme: string | undefined,
		principal: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	signOutAsync(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
