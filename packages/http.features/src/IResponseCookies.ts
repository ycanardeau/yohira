import { CookieOptions } from './CookieOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IResponseCookies.cs,455a197e95de5d19,references
/**
 * A wrapper for the response Set-Cookie header.
 */
export interface IResponseCookies {
	append(key: string, value: string, options?: CookieOptions): void;
	delete(key: string, options?: CookieOptions): void;
}
