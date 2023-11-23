import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { HttpsRedirectionMiddleware } from './HttpsRedirectionMiddleware';

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HttpsRedirectionBuilderExtensions.cs,03e9d331598cce2c,references
/**
 * Adds middleware for redirecting HTTP Requests to HTTPS.
 * @param app The {@link IApplicationBuilder} instance this method extends.
 * @returns The {@link IApplicationBuilder} for HttpsRedirection.
 */
export function useHttpsRedirection(app: IAppBuilder): IAppBuilder {
	const serverAddressFeature =
		undefined; /* TODO: app.serverFeatures.get<IServerAddressesFeature>(
			IServerAddressesFeature,
		); */
	if (serverAddressFeature !== undefined) {
		// TODO
		throw new Error('Method not implemented.');
	} else {
		useMiddleware(HttpsRedirectionMiddleware, app);
	}
	return app;
}
