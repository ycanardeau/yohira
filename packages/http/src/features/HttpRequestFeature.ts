import { IHttpRequestFeature } from '@yohira/http.features';
import { IncomingHttpHeaders } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/HttpRequestFeature.cs,5bf582cdfb7412b6,references
export class HttpRequestFeature implements IHttpRequestFeature {
	scheme: string;
	method: string;
	pathBase: string;
	path: string;
	queryString: string;
	headers: IncomingHttpHeaders;
	rawBody: string;

	constructor() {
		this.headers = {};
		this.rawBody = '';
		this.scheme = '';
		this.method = '';
		this.pathBase = '';
		this.path = '';
		this.queryString = '';
	}
}
