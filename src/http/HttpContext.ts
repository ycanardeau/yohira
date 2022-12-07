import { HttpRequest } from '@/http/HttpRequest';
import { IHttpContext } from '@/http/IHttpContext';
import { IHttpRequest } from '@/http/IHttpRequest';
import { IncomingMessage, ServerResponse } from 'node:http';

export class HttpContext implements IHttpContext {
	readonly request: IHttpRequest;

	constructor(
		readonly nativeRequest: IncomingMessage,
		readonly nativeResponse: ServerResponse<IncomingMessage>,
	) {
		this.request = new HttpRequest(this);
	}
}
