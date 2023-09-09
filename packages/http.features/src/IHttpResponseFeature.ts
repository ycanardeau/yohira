import { IncomingHttpHeaders } from 'node:http';

export const IHttpResponseFeature = Symbol.for('IHttpResponseFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpResponseFeature.cs,cac9ce0faa55e5f2,references
/**
 * Represents the fields and state of an HTTP response.
 */
export interface IHttpResponseFeature {
	/**
	 * Gets or sets the response headers to send. Headers with multiple values will be emitted as multiple headers.
	 */
	headers: IncomingHttpHeaders;
	onStarting(callback: (state: object) => Promise<void>, state: object): void;
}
