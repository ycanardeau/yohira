import { IAuthenticationFeature } from '@yohira/authentication.abstractions';
import { HttpContext } from '@yohira/http';
import { CookieBuilder } from '@yohira/http.abstractions';
import { CookieOptions } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/RequestPathBaseCookieBuilder.cs,288f77ab02479bd8,references
/**
 * A cookie builder that sets {@link CookieOptions.path} to the request path base.
 */
export class RequestPathBaseCookieBuilder extends CookieBuilder {
	/**
	 * Gets an optional value that is appended to the request path base.
	 */
	protected readonly additionalPath?: string;

	build(context: HttpContext, expiresFrom: Date): CookieOptions {
		// check if the user has overridden the default value of path. If so, use that instead of our default value.
		let path = this.path;
		if (path !== undefined) {
			const originalPathBase =
				context.features.get<IAuthenticationFeature>(
					IAuthenticationFeature,
				)?.originalPathBase ?? context.request.pathBase;
			path = originalPathBase.toString() + this.additionalPath;
		}

		const options = super.build(context, expiresFrom);

		options.path = !!path ? path : '/';

		return options;
	}
}
