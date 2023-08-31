import { tryGetValue } from '@yohira/base';
import {
	IAppBuilder,
	RequestDelegate,
	addTerminalMiddleware,
} from '@yohira/http.abstractions';

export const globalRouteBuilderKey = '__GlobalEndpointRouteBuilder';
export const useRoutingKey = '__UseRouting';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/src/Shared/Reroute.cs,6207f2a12c79d465,references
export function reroute(
	app: IAppBuilder,
	routeBuilder: unknown,
	next: RequestDelegate,
): RequestDelegate {
	const tryGetValueResult = tryGetValue(app.properties, useRoutingKey);
	if (tryGetValueResult.ok && typeof tryGetValueResult.val === 'function') {
		const builder = app.create();
		// use the old routing pipeline if it exists so we preserve all the routes and matching logic
		// ((IApplicationBuilder)WebApplication).New() does not copy GlobalRouteBuilderKey automatically like it does for all other properties.
		builder.properties.set(globalRouteBuilderKey, routeBuilder);

		// UseRouting()
		tryGetValueResult.val(builder);

		// apply the next middleware
		addTerminalMiddleware(builder, next);

		return builder.build();
	}

	return next;
}
