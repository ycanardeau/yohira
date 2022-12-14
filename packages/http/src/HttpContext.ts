import { IncomingMessage, ServerResponse } from 'node:http';

import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { IHttpContext } from './IHttpContext';
import { IHttpRequest } from './IHttpRequest';
import { IHttpResponse } from './IHttpResponse';

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
