import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { Endpoint } from '@yohira/http.abstractions/routing/Endpoint';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/EndpointHttpContextExtensions.cs,ea7f441e3031e7ce,references
export function getEndpoint(context: IHttpContext): Endpoint | undefined {
	return undefined; /* TODO */
}
