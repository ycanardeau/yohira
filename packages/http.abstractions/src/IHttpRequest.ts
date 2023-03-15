import { IRequestCookieCollection } from '@yohira/http.features';
import { IncomingHttpHeaders } from 'node:http';

import { IHttpContext } from './IHttpContext';
import { PathString } from './PathString';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpRequest.cs,ea81be9b74317002,references
export interface IHttpRequest {
	readonly httpContext: IHttpContext;
	method: string;
	path: PathString;
	queryString: string;
	readonly headers: IncomingHttpHeaders;
	/**
	 * Gets the collection of Cookies for this request.
	 * @returns The collection of Cookies for this request.
	 */
	readonly cookies: IRequestCookieCollection;
	rawBody: string;
}
