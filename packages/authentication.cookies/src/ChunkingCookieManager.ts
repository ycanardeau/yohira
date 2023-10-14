import { StringValues } from '@yohira/extensions.primitives';
import { IHttpContext } from '@yohira/http.abstractions';
import { CookieOptions } from '@yohira/http.features';

import { ICookieManager } from './ICookieManager';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/src/Shared/ChunkingCookieManager/ChunkingCookieManager.cs,839e0d8d5bf4634a,references
/**
 * This handles cookies that are limited by per cookie length. It breaks down long cookies for responses, and reassembles them
 * from requests.
 */
export class ChunkingCookieManager implements ICookieManager {
	/**
	 * The default maximum size of characters in a cookie to send back to the client.
	 */
	private static readonly defaultChunkSize = 4050;

	private static readonly chunkKeySuffix = 'C';
	private static readonly chunkCountPrefix = 'chunks-';

	/**
	 * The maximum size of cookie to send back to the client. If a cookie exceeds this size it will be broken down into multiple
	 * cookies. Set this value to null to disable this behavior. The default is 4050 characters, which is supported by all
	 * common browsers.
	 *
	 * Note that browsers may also have limits on the total size of all cookies per domain, and on the number of cookies per domain.
	 */
	chunkSize: number | undefined;

	constructor() {
		this.chunkSize = ChunkingCookieManager.defaultChunkSize;
	}

	// Parse the "chunks-XX" to determine how many chunks there should be.
	private static parseChunksCount(value: string | undefined): number {
		if (
			value !== undefined &&
			value.startsWith(ChunkingCookieManager.chunkCountPrefix)
		) {
			const chunksCount = Number(
				value.slice(ChunkingCookieManager.chunkCountPrefix.length),
			);
			if (Number.isInteger(chunksCount)) {
				return chunksCount;
			}
		}
		return 0;
	}

	/**
	 * Get the reassembled cookie. Non chunked cookies are returned normally.
	 * Cookies with missing chunks just have their "chunks-XX" header returned.
	 * @param context
	 * @param key
	 * @returns The reassembled cookie, if any, or undefined.
	 */
	getRequestCookie(context: IHttpContext, key: string): string | undefined {
		const requestCookies = context.request.cookies;
		const value = requestCookies.get(key);
		const chunksCount = ChunkingCookieManager.parseChunksCount(value);
		if (chunksCount > 0) {
			// TODO
			throw new Error('Method not implemented.');
		}
		return value;
	}

	appendResponseCookie(
		context: IHttpContext,
		key: string,
		value: string | undefined,
		options: CookieOptions,
	): void {
		const responseCookies = context.response.cookies;

		if (!value) {
			responseCookies.append(key, '', options);
			return;
		}

		const templateLength = options
			.createCookieHeader(key, '')
			.toString().length;

		// Normal cookie
		if (
			this.chunkSize === undefined ||
			this.chunkSize > templateLength + value.length
		) {
			responseCookies.append(key, value, options);
		} else if (this.chunkSize < templateLength + 10) {
			// 10 is the minimum data we want to put in an individual cookie, including the cookie chunk identifier "CXX".
			// No room for data, we can't chunk the options and name
			throw new Error(
				'The cookie key and options are larger than ChunksSize, leaving no room for data.',
			);
		} else {
			// Break the cookie down into multiple cookies.
			// Key = CookieName, value = "Segment1Segment2Segment2"
			// Set-Cookie: CookieName=chunks-3; path=/
			// Set-Cookie: CookieNameC1="Segment1"; path=/
			// Set-Cookie: CookieNameC2="Segment2"; path=/
			// Set-Cookie: CookieNameC3="Segment3"; path=/

			// TODO
			throw new Error('Method not implemented.');
		}
	}

	deleteCookie(
		context: IHttpContext,
		key: string,
		options: CookieOptions,
	): void {
		const keys = [key + '='];

		const requestCookies = context.request.cookies;
		const requestCookie = requestCookies.get(key);
		let chunks = ChunkingCookieManager.parseChunksCount(requestCookie);
		if (chunks > 0) {
			for (let i = 1; i <= chunks + 1; i++) {
				const subkey =
					key +
					ChunkingCookieManager.chunkKeySuffix +
					i.toString(); /* TODO */

				// Only delete cookies we received. We received the chunk count cookie so we should have received the others too.
				if (!requestCookies.get(subkey)) {
					chunks = i - 1;
					break;
				}

				keys.push(subkey + '=');
			}
		}

		const domainHasValue = !!options.domain;
		const pathHasValue = !!options.path;

		let rejectPredicate: (value: string) => boolean;
		const predicate = (value: string): boolean =>
			keys.some((k) => value.startsWith(k));
		if (domainHasValue) {
			rejectPredicate = (value): boolean =>
				predicate(value) && value.includes('domain=' + options.domain);
		} else if (pathHasValue) {
			rejectPredicate = (value): boolean =>
				predicate(value) && value.includes('path=' + options.path);
		} else {
			rejectPredicate = (value): boolean => predicate(value);
		}

		const responseHeaders = context.response.headers;
		const existingValues = new StringValues(
			responseHeaders.getHeader('set-cookie') as
				| string
				| string[] /* REVIEW */,
		);

		if (!StringValues.isUndefinedOrEmpty(existingValues)) {
			const values = existingValues.toArray();
			const newValues: string[] = [];

			for (let i = 0; i < values.length; i++) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const value = values[i]!;
				if (!rejectPredicate(value)) {
					newValues.push(value);
				}
			}

			responseHeaders.setHeader('set-cookie', newValues);
		}

		const responseCookies = context.response.cookies;

		const keyValuePairs: [string, string][] = new Array(chunks + 1);
		keyValuePairs[0] = [key, ''];

		for (let i = 1; i <= chunks; i++) {
			keyValuePairs[i] = [key + 'C' + i.toString() /* TODO */, ''];
		}

		for (const [key, value] of keyValuePairs) {
			responseCookies.append(
				key,
				value,
				((): CookieOptions => {
					const cookieOptions = CookieOptions.fromOptions(options);
					cookieOptions.expires = 0;
					return cookieOptions;
				})(),
			);
		}
	}
}
