import { IncomingHttpHeaders } from 'node:http';

export const IHttpRequestFeature = Symbol.for('IHttpRequestFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpRequestFeature.cs,6e78bf067a671192,references
export interface IHttpRequestFeature {
	scheme: string;
	method: string;
	pathBase: string;
	path: string;
	queryString: string;
	requestHeaders: IncomingHttpHeaders;
	rawBody: string;
}
