import {
	IAuthenticateResultFeature,
	IAuthenticationFeature,
	IAuthenticationHandler,
	IAuthenticationHandlerProvider,
	IAuthenticationRequestHandler,
	IAuthenticationSchemeProvider,
	authenticate,
} from '@yohira/authentication.abstractions';
import { AuthenticationFeature } from '@yohira/authentication.core';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import {
	IHttpContext,
	IMiddleware,
	RequestDelegate,
} from '@yohira/http.abstractions';
import { IHttpAuthenticationFeature } from '@yohira/http.features';

import { AuthenticationFeatures } from './AuthenticationFeatures';

function isIAuthenticationRequestHandler(
	handler: IAuthenticationHandler,
): handler is IAuthenticationRequestHandler {
	return 'handleRequest' in handler;
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationMiddleware.cs,20a6e8d8983fbe5c,references
/**
 * Middleware that performs authentication.
 */
export class AuthenticationMiddleware implements IMiddleware {
	constructor(readonly schemes: IAuthenticationSchemeProvider) {}

	async invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		context.features.set(
			IAuthenticationFeature,
			((): AuthenticationFeature => {
				const feature = new AuthenticationFeature();
				feature.originalPath = context.request.path;
				feature.originalPathBase = context.request.pathBase;
				return feature;
			})(),
		);

		// Give any IAuthenticationRequestHandler schemes a chance to handle the request
		const handlers = getRequiredService<IAuthenticationHandlerProvider>(
			context.requestServices,
			IAuthenticationHandlerProvider,
		);
		for (const scheme of await this.schemes.getRequestHandlerSchemes()) {
			const handler = await handlers.getHandler(context, scheme.name);
			if (
				handler !== undefined &&
				isIAuthenticationRequestHandler(handler) &&
				(await handler.handleRequest())
			) {
				return;
			}
		}

		const defaultAuthenticate =
			await this.schemes.getDefaultAuthenticateScheme();
		if (defaultAuthenticate !== undefined) {
			const result = await authenticate(
				context,
				defaultAuthenticate.name,
			);
			if (result.principal !== undefined) {
				context.user = result.principal;
			}
			if (result?.succeeded) {
				const authFeatures = new AuthenticationFeatures(result);
				context.features.set<IHttpAuthenticationFeature>(
					IHttpAuthenticationFeature,
					authFeatures,
				);
				context.features.set<IAuthenticateResultFeature>(
					IAuthenticateResultFeature,
					authFeatures,
				);
			}
		}

		await next(context);
	}
}
