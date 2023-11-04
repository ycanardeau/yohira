import { IRequestCookieCollection } from '@yohira/http.features';
import { IncomingHttpHeaders } from 'node:http';

import { HostString } from './HostString';
import { IHttpContext } from './IHttpContext';
import { PathString } from './PathString';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpRequest.cs,ea81be9b74317002,references
export interface IHttpRequest {
	readonly httpContext: IHttpContext;
	method: string;
	/**
	 * Gets or sets the HTTP request scheme.
	 * @returns The HTTP request scheme.
	 */
	scheme: string;
	/**
	 * Returns true if the RequestScheme is https.
	 * @returns true if this request is using https; otherwise, false.
	 */
	isHttps: boolean;
	/**
	 * Gets or sets the Host header. May include the port.
	 * @returns The Host header.
	 */
	host: HostString;
	pathBase: PathString;
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
