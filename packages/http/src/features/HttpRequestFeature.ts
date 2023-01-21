import { IHttpRequestFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/HttpRequestFeature.cs,5bf582cdfb7412b6,references
export class HttpRequestFeature implements IHttpRequestFeature {
	method: string;
	path: string;

	constructor() {
		this.method = '';
		this.path = '';
	}
}
