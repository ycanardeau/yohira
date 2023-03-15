import { IHeaderDictionary, IResponseCookies } from '@yohira/http.features';
import { Stream } from 'node:stream';

import { IHttpContext } from './IHttpContext';
import { StatusCodes } from './StatusCodes';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpResponse.cs,7642421540ea6ef2,references
/**
 * Represents the outgoing side of an individual HTTP request.
 */
export interface IHttpResponse {
	/**
	 * Gets the {@link IHttpContext} for this response.
	 */
	readonly httpContext: IHttpContext;
	/**
	 * Gets or sets the HTTP response code.
	 */
	statusCode: StatusCodes;
	/**
	 * Gets the response headers.
	 */
	headers: IHeaderDictionary;
	/**
	 * Gets or sets the response body {@link Stream}.
	 */
	body: Stream;
	/**
	 * Gets or sets the value for the <c>Content-Type</c> response header.
	 */
	contentType: string | undefined;
	/**
	 * Gets an object that can be used to manage cookies for this response.
	 */
	readonly cookies: IResponseCookies;
	/**
	 * Gets a value indicating whether response headers have been sent to the client.
	 */
	readonly hasStarted: boolean;
	onStarting(callback: (state: object) => Promise<void>, state: object): void;
}
