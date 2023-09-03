import { SameSiteMode } from './SameSiteMode';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/CookieOptions.cs,14d3cbcab9624444,references
export class CookieOptions {
	private _extensions: string[] | undefined;

	domain?: string;
	path?: string;
	expires?: number /* REVIEW */;
	secure = false;
	sameSite = SameSiteMode.Unspecified;
	httpOnly = false;
	maxAge?: number /* REVIEW */;
	isEssential = false;

	/**
	 * Gets a collection of additional values to append to the cookie.
	 */
	get extensions(): string[] {
		return (this._extensions ??= []);
	}
}
