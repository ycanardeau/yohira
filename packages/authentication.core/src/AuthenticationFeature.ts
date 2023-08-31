import { IAuthenticationFeature } from '@yohira/authentication.abstractions';
import { PathString } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationFeature.cs,cf7dfd819fcc7057,references
/**
 * Used to capture path info so redirects can be computed properly within an app.Map().
 */
export class AuthenticationFeature implements IAuthenticationFeature {
	/**
	 * The original path base.
	 */
	originalPathBase!: PathString;

	/**
	 * The original path.
	 */
	originalPath!: PathString;
}
