import { AntiforgeryToken } from './AntiforgeryToken';
import { IAntiforgeryFeature } from './IAntiforgeryFeature';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/AntiforgeryFeature.cs,8c0c0205066b3e98,references
/**
 * Used to hold per-request state.
 */
export class AntiforgeryFeature implements IAntiforgeryFeature {
	haveDeserializedCookieToken = false;
	cookieToken: AntiforgeryToken | undefined;
	haveDeserializedRequestToken = false;
	requestToken: AntiforgeryToken | undefined;
	haveGeneratedNewCookieToken = false;
	// After HaveGeneratedNewCookieToken is true, remains null if CookieToken is valid.
	newCookieToken: AntiforgeryToken | undefined;
	// After HaveGeneratedNewCookieToken is true, remains null if CookieToken is valid.
	newCookieTokenString: string | undefined;
	newRequestToken: AntiforgeryToken | undefined;
	newRequestTokenString: string | undefined;
	// Always false if NewCookieToken is null. Never store null cookie token or re-store cookie token from request.
	haveStoredNewCookieToken = false;
}
