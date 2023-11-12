import { AntiforgeryToken } from './AntiforgeryToken';

export const IAntiforgeryFeature = Symbol.for('IAntiforgeryFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/IAntiforgeryFeature.cs,5c5a8e047f067ae9,references
export interface IAntiforgeryFeature {
	cookieToken: AntiforgeryToken | undefined;
	haveDeserializedCookieToken: boolean;
	haveDeserializedRequestToken: boolean;
	haveGeneratedNewCookieToken: boolean;
	haveStoredNewCookieToken: boolean;
	newCookieToken: AntiforgeryToken | undefined;
	newCookieTokenString: string | undefined;
	newRequestToken: AntiforgeryToken | undefined;
	newRequestTokenString: string | undefined;
	requestToken: AntiforgeryToken | undefined;
}
