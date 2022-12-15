import {
	IHttpContext,
	IHttpRequest,
	IHttpResponse,
} from '@yohira/http.abstractions';
import { IncomingMessage, ServerResponse } from 'node:http';

import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,804830786046817e,references
export class HttpContext implements IHttpContext {
	readonly request: IHttpRequest;
	readonly response: IHttpResponse;

	constructor(
		readonly nativeRequest: IncomingMessage,
		readonly nativeResponse: ServerResponse<IncomingMessage>,
	) {
		this.request = new HttpRequest(this);
		this.response = new HttpResponse(this);
	}
}