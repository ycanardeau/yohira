import { IFeatureCollection } from '@yohira/extensions.features';
import {
	IResponseCookies,
	IResponseCookiesFeature,
} from '@yohira/http.features';

import { ResponseCookies } from '../internal/ResponseCookies';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/ResponseCookiesFeature.cs,006aee9c11bbeecb,references
/**
 * Default implementation of {@link IResponseCookiesFeature}.
 */
export class ResponseCookiesFeature implements IResponseCookiesFeature {
	private cookiesCollection: IResponseCookies | undefined;

	constructor(private readonly features: IFeatureCollection) {}

	get cookies(): IResponseCookies {
		if (this.cookiesCollection === undefined) {
			this.cookiesCollection = new ResponseCookies(this.features);
		}

		return this.cookiesCollection;
	}
}
