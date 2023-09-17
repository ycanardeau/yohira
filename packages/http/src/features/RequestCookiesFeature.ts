import {
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import { StringValues } from '@yohira/extensions.primitives';
import { RequestCookieCollection } from '@yohira/http';
import {
	IHttpRequestFeature,
	IRequestCookieCollection,
	IRequestCookiesFeature,
} from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/RequestCookiesFeature.cs,7a6678fd34debc93,references
export class RequestCookiesFeature implements IRequestCookiesFeature {
	private static readonly nullRequestFeature = ():
		| IHttpRequestFeature
		| undefined => undefined;

	private features = new FeatureReferences<IHttpRequestFeature | undefined>(
		() => undefined,
	);
	private original = StringValues.empty;
	private parsedValues?: IRequestCookieCollection;

	constructor(features: IFeatureCollection) {
		this.features.initialize(features);
	}

	private get httpRequestFeature(): IHttpRequestFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			IHttpRequestFeature,
			{
				get: () => this.features.cache,
				set: (value) => (this.features.cache = value),
			},
			this.features,
			RequestCookiesFeature.nullRequestFeature,
		)!;
	}

	get cookies(): IRequestCookieCollection {
		if (this.features.collection === undefined) {
			if (this.parsedValues === undefined) {
				this.parsedValues = RequestCookieCollection.empty;
			}
			return this.parsedValues;
		}

		const headers = this.httpRequestFeature.requestHeaders;
		const current = new StringValues(headers.cookie);

		if (this.parsedValues === undefined || !this.original.equals(current)) {
			this.original = current;
			this.parsedValues = RequestCookieCollection.parse(current);
		}

		return this.parsedValues;
	}
	set cookies(value: IRequestCookieCollection) {
		// TODO
		throw new Error('Method not implemented.');
	}
}
