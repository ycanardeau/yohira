import {
	IHttpResponseFeature,
	IResponseHeaderDictionary,
} from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/HttpResponseFeature.cs,ec40a2c75bf6aa7c,references
export class HttpResponseFeature implements IHttpResponseFeature {
	responseHeaders: IResponseHeaderDictionary;

	constructor() {
		this.responseHeaders = {} as IResponseHeaderDictionary /* TODO */;
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
