import {
	IAuthenticationHandler,
	IAuthenticationHandlerProvider,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationHandlerProvider.cs,faf7f6af86a4bb67,references
/**
 * Implementation of {@link IAuthenticationHandlerProvider}.
 */
export class AuthenticationHandlerProvider
	implements IAuthenticationHandlerProvider
{
	getHandler(
		context: IHttpContext,
		authenticationScheme: string,
	): Promise<IAuthenticationHandler | undefined> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
