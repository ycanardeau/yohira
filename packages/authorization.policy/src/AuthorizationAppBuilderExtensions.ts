import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { AuthorizationMiddleware } from './AuthorizationMiddleware';

const authorizationMiddlewareSetKey = '__AuthorizationMiddlewareSet';

// https://source.dot.net/#Microsoft.AspNetCore.Authorization.Policy/AuthorizationAppBuilderExtensions.cs,0acf47af950f4423,references
function verifyServicesRegistered(app: IAppBuilder): void {
	// Verify that AddAuthorizationPolicy was called before calling UseAuthorization
	// We use the AuthorizationPolicyMarkerService to ensure all the services were added.
	if (
		app.appServices.getService(
			Symbol.for('AuthorizationPolicyMarkerService'),
		) === undefined
	) {
		throw new Error(
			`Unable to find the required services. Please add all the required services by calling 'IServiceCollection.addAuthorization' in the application startup code.`,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Authorization.Policy/AuthorizationAppBuilderExtensions.cs,a75da16ff8887012,references
export function useAuthorization(app: IAppBuilder): IAppBuilder {
	verifyServicesRegistered(app);

	app.properties.set(authorizationMiddlewareSetKey, true);
	return useMiddleware(AuthorizationMiddleware, app);
}
