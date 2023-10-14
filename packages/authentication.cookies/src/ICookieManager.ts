import { IHttpContext } from '@yohira/http.abstractions';
import { CookieOptions } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/ICookieManager.cs,f7ae13a4c2221659,references
/**
 * This is used by the CookieAuthenticationMiddleware to process request and response cookies.
 * It is abstracted from the normal cookie APIs to allow for complex operations like chunking.
 */
export interface ICookieManager {
	/**
	 * Retrieve a cookie of the given name from the request.
	 * @param context
	 * @param key
	 */
	getRequestCookie(context: IHttpContext, key: string): string | undefined;

	/**
	 * Append the given cookie to the response.
	 * @param context
	 * @param key
	 * @param value
	 * @param options
	 */
	appendResponseCookie(
		context: IHttpContext,
		key: string,
		value: string | undefined,
		options: CookieOptions,
	): void;

	/**
	 * Append a delete cookie to the response.
	 * @param context
	 * @param key
	 * @param options
	 */
	deleteCookie(
		context: IHttpContext,
		key: string,
		options: CookieOptions,
	): void;
}
