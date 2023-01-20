import { IServiceProvider } from '@yohira/base';
import { IFeatureCollection } from '@yohira/extensions.features';
import {
	IHttpContext,
	IHttpRequest,
	IHttpResponse,
} from '@yohira/http.abstractions';
import { IServiceProvidersFeature } from '@yohira/http.features';

import { HttpRequest } from './internal/HttpRequest';
import { HttpResponse } from './internal/HttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,804830786046817e,references
export class HttpContext implements IHttpContext {
	readonly request: IHttpRequest;
	readonly response: IHttpResponse;

	constructor(features: IFeatureCollection) {
		this.request = new HttpRequest(this);
		this.response = new HttpResponse(this);
	}

	private get serviceProvidersFeature(): IServiceProvidersFeature {
		// TODO
		throw new Error('Method not implemented.');
	}

	get features(): IFeatureCollection {
		// TODO
		throw new Error('Method not implemented.');
	}

	get requestServices(): IServiceProvider {
		return this.serviceProvidersFeature.requestServices;
	}
	set requestServices(value: IServiceProvider) {
		this.serviceProvidersFeature.requestServices = value;
	}
}
