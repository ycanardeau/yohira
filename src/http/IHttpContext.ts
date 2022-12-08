import { Endpoint } from '@/http/Endpoint';
import { IHttpRequest } from '@/http/IHttpRequest';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpContext.cs,9bde6e3833d169c1,references
export interface IHttpContext {
	readonly request: IHttpRequest;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/EndpointHttpContextExtensions.cs,ea7f441e3031e7ce,references
export const getEndpoint = (context: IHttpContext): Endpoint | undefined => {
	return undefined; /* TODO */
};
