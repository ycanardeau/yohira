import { IHttpContext } from '@/http/IHttpContext';
import { IHttpResponse } from '@/http/IHttpResponse';
import { StatusCodes } from '@/http/StatusCodes';

export class HttpResponse implements IHttpResponse {
	constructor(readonly httpContext: IHttpContext) {}

	get statusCode(): StatusCodes {
		// TODO
		throw new Error('Method not implemented.');
	}
	set statusCode(value: StatusCodes) {
		// TODO
		throw new Error('Method not implemented.');
	}
}
