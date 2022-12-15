import { IServiceProvider } from '@yohira/dependency-injection.abstractions';
import {
	IHttpContext,
	IHttpRequest,
	IHttpResponse,
} from '@yohira/http.abstractions';
import {
	IServiceProvidersFeature,
	RequestServicesFeature,
} from '@yohira/http.features';
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

	// TODO
	private _serviceProvidersFeature = new RequestServicesFeature();
	private get serviceProvidersFeature(): IServiceProvidersFeature {
		return this._serviceProvidersFeature;
	}

	get requestServices(): IServiceProvider {
		return this.serviceProvidersFeature.requestServices;
	}
	set requestServices(value: IServiceProvider) {
		this.serviceProvidersFeature.requestServices = value;
	}
}
