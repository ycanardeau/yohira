import { SameSiteMode } from './SameSiteMode';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/CookieOptions.cs,14d3cbcab9624444,references
export class CookieOptions {
	domain?: string;
	path?: string;
	expires?: number /* REVIEW */;
	secure = false;
	sameSite = SameSiteMode.Unspecified;
	httpOnly = false;
	maxAge?: number /* REVIEW */;
	isEssential = false;
}
