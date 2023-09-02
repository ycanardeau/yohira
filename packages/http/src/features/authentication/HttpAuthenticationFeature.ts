import { ClaimsPrincipal } from '@yohira/authentication.abstractions';
import { IHttpAuthenticationFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/Authentication/HttpAuthenticationFeature.cs,b153cb57fd6bbe4e,references
/**
 * Default implementation for {@link IHttpAuthenticationFeature}.
 */
export class HttpAuthenticationFeature implements IHttpAuthenticationFeature {
	user: ClaimsPrincipal | undefined;
}
