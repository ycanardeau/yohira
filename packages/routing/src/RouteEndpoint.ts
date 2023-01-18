import { Endpoint, RequestDelegate } from '@yohira/http.abstractions';

import { RoutePattern } from './patterns/RoutePattern';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpoint.cs,60b018d52e2d0a7f,references
export class RouteEndpoint extends Endpoint {
	constructor(
		requestDelegate: RequestDelegate,
		readonly routePattern: RoutePattern,
		displayName: string | undefined,
	) {
		super(requestDelegate, displayName);
	}
}
