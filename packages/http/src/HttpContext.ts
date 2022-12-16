import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { IHttpRequest } from '@yohira/http.abstractions/IHttpRequest';
import { IHttpResponse } from '@yohira/http.abstractions/IHttpResponse';
import { HttpRequest } from '@yohira/http/internal/HttpRequest';
import { HttpResponse } from '@yohira/http/internal/HttpResponse';
import { IncomingMessage, ServerResponse } from 'node:http';

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
