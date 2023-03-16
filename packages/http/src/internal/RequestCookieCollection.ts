import { CaseInsensitiveMap, tryGetValue } from '@yohira/base';
import { StringValues } from '@yohira/extensions.primitives';
import { IRequestCookieCollection } from '@yohira/http.features';
import { tryParseCookieHeaderValues } from '@yohira/http.shared';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/RequestCookieCollection.cs,34d8bfffeeac1069,references
export class RequestCookieCollection implements IRequestCookieCollection {
	static readonly empty = new RequestCookieCollection();
	private static readonly emptyKeys: string[] = [];

	private static readonly emptyIterator = [][Symbol.iterator];

	private store?: CaseInsensitiveMap<string>; /* TODO: AdaptiveCapacityDictionary */

	constructor() {
		this.store = new CaseInsensitiveMap<string>();
	}

	get count(): number {
		if (this.store === undefined) {
			return 0;
		}
		return this.store.size;
	}

	get keys(): string[] {
		if (this.store === undefined) {
			return RequestCookieCollection.emptyKeys;
		}
		return Array.from(this.store.keys());
	}

	static parse(values: StringValues): RequestCookieCollection {
		if (values.count === 0) {
			return RequestCookieCollection.empty;
		}

		// Do not set the collection capacity based on StringValues.Count, the Cookie header is supposed to be a single combined value.
		const collection = new RequestCookieCollection();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const store = collection.store!;

		if (tryParseCookieHeaderValues(values, store, true)) {
			if (store.size === 0) {
				return RequestCookieCollection.empty;
			}

			return collection;
		}
		return RequestCookieCollection.empty;
	}

	get(key: string): string | undefined {
		if (this.store === undefined) {
			return undefined;
		}

		const tryGetValueResult = tryGetValue(this.store, key);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val;
		}
		return undefined;
	}

	[Symbol.iterator](): Iterator<[string, string]> {
		if (this.store === undefined || this.store.size === 0) {
			return RequestCookieCollection.emptyIterator();
		}
		return this.store[Symbol.iterator]();
	}
}
