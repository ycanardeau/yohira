import {
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import {
	IHttpRequestFeature,
	IRequestCookieCollection,
	IRequestCookiesFeature,
} from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/RequestCookiesFeature.cs,7a6678fd34debc93,references
export class RequestCookiesFeature implements IRequestCookiesFeature {
	private features = new FeatureReferences<IHttpRequestFeature | undefined>(
		() => undefined,
	);

	constructor(features: IFeatureCollection) {
		this.features.initialize(features);
	}

	get cookies(): IRequestCookieCollection {
		// TODO
		throw new Error('Method not implemented.');
	}
	set cookies(value: IRequestCookieCollection) {
		// TODO
		throw new Error('Method not implemented.');
	}
}
