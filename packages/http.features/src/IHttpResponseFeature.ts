import { HeaderNames } from '@yohira/http.headers';
import { IncomingMessage, ServerResponse } from 'node:http';

export interface IResponseHeaderDictionary
	extends Pick<
		ServerResponse<IncomingMessage>,
		'setHeader' | 'getHeader' | 'getHeaders' | 'hasHeader'
	> {
	setHeader(
		name: HeaderNames,
		value: number | string | ReadonlyArray<string>,
	): ServerResponse<IncomingMessage>;
	getHeader(name: HeaderNames): number | string | string[] | undefined;
	hasHeader(name: HeaderNames): boolean;
}

export const IHttpResponseFeature = Symbol.for('IHttpResponseFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpResponseFeature.cs,cac9ce0faa55e5f2,references
/**
 * Represents the fields and state of an HTTP response.
 */
export interface IHttpResponseFeature {
	/**
	 * Gets or sets the response headers to send. Headers with multiple values will be emitted as multiple headers.
	 */
	responseHeaders: IResponseHeaderDictionary;
	readonly hasStarted: boolean;
	onStarting(callback: (state: object) => Promise<void>, state: object): void;
	onCompleted(
		callback: (state: object) => PromiseLike<void>,
		state: object,
	): void;
}
