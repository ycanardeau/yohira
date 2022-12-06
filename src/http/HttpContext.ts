import { IHttpContext } from '@/http/IHttpContext';
import { IncomingMessage, ServerResponse } from 'node:http';

export class HttpContext implements IHttpContext {
	constructor(
		readonly nativeRequest: IncomingMessage,
		readonly nativeResponse: ServerResponse<IncomingMessage>,
	) {}
}
