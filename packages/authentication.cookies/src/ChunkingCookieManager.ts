import { IHttpContext } from '@yohira/http.abstractions';
import { CookieOptions } from '@yohira/http.features';

import { ICookieManager } from './ICookieManager';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/src/Shared/ChunkingCookieManager/ChunkingCookieManager.cs,839e0d8d5bf4634a,references
/**
 * This handles cookies that are limited by per cookie length. It breaks down long cookies for responses, and reassembles them
 * from requests.
 */
export class ChunkingCookieManager implements ICookieManager {
	private static readonly chunkCountPrefix = 'chunks-';

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
		// TODO
		throw new Error('Method not implemented.');
	}
}
