import { IAsyncDisposable, IDisposable } from '@yohira/base';
import {
	IResponseCookies,
	IResponseHeaderDictionary,
} from '@yohira/http.features';
import { Stream } from 'node:stream';

import { IHttpContext } from './IHttpContext';
import { StatusCodes } from './StatusCodes';

function isIAsyncDisposable(
	service: object | IDisposable | IAsyncDisposable | undefined,
): service is IAsyncDisposable {
	return service !== undefined && Symbol.asyncDispose in service;
}

function isIDisposable(
	service: object | IDisposable | IAsyncDisposable | undefined,
): service is IDisposable {
	return service !== undefined && Symbol.dispose in service;
}

export const disposeDelegate = (state: object): Promise<void> => {
	// Prefer async dispose over dispose
	if (isIAsyncDisposable(state)) {
		return state[Symbol.asyncDispose]();
	} else if (isIDisposable(state)) {
		state[Symbol.dispose]();
	}
	return Promise.resolve();
};

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
	headers: IResponseHeaderDictionary;
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
	onCompleted(
		callback: (state: object) => Promise<void>,
		state: object,
	): void;
	registerForDisposeAsync(disposable: IAsyncDisposable): void;
}
