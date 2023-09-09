import {
	IFeatureCollection,
	getRequiredFeature,
} from '@yohira/extensions.features';
import {
	CookieOptions,
	IHttpResponseFeature,
	IResponseCookies,
} from '@yohira/http.features';
import { IncomingHttpHeaders } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/ResponseCookies.cs,8029ad80fcd25000,references
/**
 * A wrapper for the response Set-Cookie header.
 */
export class ResponseCookies implements IResponseCookies {
	private headers: IncomingHttpHeaders;

	constructor(private readonly features: IFeatureCollection) {
		this.headers = getRequiredFeature<IHttpResponseFeature>(
			this.features,
			IHttpResponseFeature,
		).headers;
	}

	append(
		key: string,
		value: string,
		options?: CookieOptions | undefined,
	): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	delete(key: string, options?: CookieOptions | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
