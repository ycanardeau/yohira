import { StatusCodes } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HttpsRedirectionOptions.cs,0a5f216e0b0ca989,references
/**
 * Options for the HTTPS Redirection Middleware.
 */
export class HttpsRedirectionOptions {
	/**
	 * The status code used for the redirect response. The default is 307.
	 */
	redirectStatusCode = StatusCodes.Status307TemporaryRedirect;

	httpsPort: number | undefined;
}
