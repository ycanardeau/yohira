import { StatusCodes } from '@yohira/http.abstractions';
import {
	IHttpResponseFeature,
	IResponseHeaderDictionary,
} from '@yohira/http.features';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/HttpResponseFeature.cs,ec40a2c75bf6aa7c,references
export class HttpResponseFeature implements IHttpResponseFeature {
	statusCode: StatusCodes;
	responseHeaders: IResponseHeaderDictionary;

	constructor() {
		this.statusCode = StatusCodes.Status200OK;
		this.responseHeaders = new ServerResponse(
			new IncomingMessage(new Socket()),
		);
	}

	get hasStarted(): boolean {
		return false;
	}

	onStarting(
		callback: (state: object) => Promise<void>,
		state: object,
	): void {}

	onCompleted(
		callback: (state: object) => Promise<void>,
		state: object,
	): void {}
}
