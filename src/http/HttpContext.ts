import { HttpRequest } from '@/http/HttpRequest';
import { HttpResponse } from '@/http/HttpResponse';
import { IHttpContext } from '@/http/IHttpContext';
import { IHttpRequest } from '@/http/IHttpRequest';
import { IHttpResponse } from '@/http/IHttpResponse';
import { IncomingMessage, ServerResponse } from 'node:http';

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
