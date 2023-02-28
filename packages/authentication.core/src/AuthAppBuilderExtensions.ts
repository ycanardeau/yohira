import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { AuthenticationMiddleware } from './AuthenticationMiddleware';

const authenticationMiddlewareSetKey = '__AuthenticationMiddlewareSet';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthAppBuilderExtensions.cs,76fd8c6b010fbd0c,references
export function useAuthentication(app: IAppBuilder): IAppBuilder {
	app.properties.set(authenticationMiddlewareSetKey, true);
	return useMiddleware(AuthenticationMiddleware, app);
}
