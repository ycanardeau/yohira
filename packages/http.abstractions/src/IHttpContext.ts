import { IServiceProvider } from '@yohira/dependency-injection.abstractions';

import { Endpoint } from './Endpoint';
import { IHttpRequest } from './IHttpRequest';
import { IHttpResponse } from './IHttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpContext.cs,9bde6e3833d169c1,references
export interface IHttpContext {
	/**
	 * Gets the {@link IHttpRequest} object for this request.
	 */
	readonly request: IHttpRequest;
	/**
	 * Gets the {@link IHttpResponse} object for this request.
	 */
	readonly response: IHttpResponse;
	/**
	 * Gets or sets the {@link IServiceProvider} that provides access to the request's service container.
	 */
	requestServices: IServiceProvider;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/EndpointHttpContextExtensions.cs,ea7f441e3031e7ce,references
export const getEndpoint = (context: IHttpContext): Endpoint | undefined => {
	return undefined; /* TODO */
};
