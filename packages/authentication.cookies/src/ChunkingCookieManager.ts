import { IHttpContext } from '@yohira/http.abstractions';

import { ICookieManager } from './ICookieManager';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/src/Shared/ChunkingCookieManager/ChunkingCookieManager.cs,839e0d8d5bf4634a,references
/**
 * This handles cookies that are limited by per cookie length. It breaks down long cookies for responses, and reassembles them
 * from requests.
 */
export class ChunkingCookieManager implements ICookieManager {
	getRequestCookie(context: IHttpContext, key: string): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}
}
