import { IServiceProvider } from '@yohira/base';
import { IFeatureCollection } from '@yohira/extensions.features';

import { IHttpRequest } from './IHttpRequest';
import { IHttpResponse } from './IHttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpContext.cs,9bde6e3833d169c1,references
export interface IHttpContext {
	/**
	 * Gets the collection of HTTP features provided by the server and middleware available on this request.
	 */
	readonly features: IFeatureCollection;
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
