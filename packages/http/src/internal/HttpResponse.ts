import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { IHttpResponse } from '@yohira/http.abstractions/IHttpResponse';
import { StatusCodes } from '@yohira/http.abstractions/StatusCodes';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpResponse.cs,d36a5786d91e7a26,references
export class HttpResponse implements IHttpResponse {
	constructor(readonly httpContext: IHttpContext) {}

	// TODO
	private _statusCode = StatusCodes.Status200OK;
	get statusCode(): StatusCodes {
		return this._statusCode;
	}
	set statusCode(value: StatusCodes) {
		this._statusCode = value;
	}

	// TODO
	private _contentType?: string;
	get contentType(): string | undefined {
		return this._contentType;
	}
	set contentType(value: string | undefined) {
		this._contentType = value;
	}
}
