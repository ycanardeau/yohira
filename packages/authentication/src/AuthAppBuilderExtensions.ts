import { IAuthenticationSchemeProvider } from '@yohira/authentication.abstractions';
import { tryGetValue } from '@yohira/base';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { IAppBuilder, use, useMiddleware } from '@yohira/http.abstractions';
import { globalRouteBuilderKey, reroute } from '@yohira/shared';

import { AuthenticationMiddleware } from './AuthenticationMiddleware';

const authenticationMiddlewareSetKey = '__AuthenticationMiddlewareSet';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthAppBuilderExtensions.cs,76fd8c6b010fbd0c,references
export function useAuthentication(app: IAppBuilder): IAppBuilder {
	app.properties.set(authenticationMiddlewareSetKey, true);

	// The authentication middleware adds annotation to HttpContext.Items to indicate that it has run
	// that will be validated by the EndpointsRoutingMiddleware later. To do this, we need to ensure
	// that routing has run and set the endpoint feature on the HttpContext associated with the request.
	const tryGetValueResult = tryGetValue(
		app.properties,
		globalRouteBuilderKey,
	);
	if (tryGetValueResult.ok) {
		return use(app, (context, next) => {
			const newNext = reroute(app, tryGetValueResult.val, next);
			const authenticationSchemeProvider =
				getRequiredService<IAuthenticationSchemeProvider>(
					app.appServices,
					IAuthenticationSchemeProvider,
				);
			return new AuthenticationMiddleware(
				authenticationSchemeProvider,
			).invoke(context, newNext);
		});
	}

	return useMiddleware(AuthenticationMiddleware, app);
}
