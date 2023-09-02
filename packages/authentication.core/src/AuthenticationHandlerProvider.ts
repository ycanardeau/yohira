import {
	IAuthenticationHandler,
	IAuthenticationHandlerProvider,
	IAuthenticationSchemeProvider,
} from '@yohira/authentication.abstractions';
import { tryGetValue } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationHandlerProvider.cs,faf7f6af86a4bb67,references
/**
 * Implementation of {@link IAuthenticationHandlerProvider}.
 */
export class AuthenticationHandlerProvider
	implements IAuthenticationHandlerProvider
{
	private readonly handlerMap = new Map<string, IAuthenticationHandler>();

	constructor(
		@inject(IAuthenticationSchemeProvider)
		readonly schemes: IAuthenticationSchemeProvider,
	) {}

	async getHandler(
		context: IHttpContext,
		authenticationScheme: string,
	): Promise<IAuthenticationHandler | undefined> {
		const tryGetValueResult = tryGetValue(
			this.handlerMap,
			authenticationScheme,
		);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val;
		}

		const scheme = await this.schemes.getScheme(authenticationScheme);
		if (scheme === undefined) {
			return undefined;
		}
		const handler =
			context.requestServices.getService<IAuthenticationHandler>(
				Symbol.for(scheme.handlerCtor.name),
			) ?? new scheme.handlerCtor(context.requestServices);
		if (handler !== undefined) {
			await handler.initialize(scheme, context);
			this.handlerMap.set(authenticationScheme, handler);
		}
		return handler;
	}
}
