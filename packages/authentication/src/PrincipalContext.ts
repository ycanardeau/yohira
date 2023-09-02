import {
	AuthenticationProperties,
	AuthenticationScheme,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';
import { PropertiesContext } from './PropertiesContext';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/Events/PrincipalContext.cs,1e899496bba50fb5,references
/**
 * Base context for authentication events which deal with a ClaimsPrincipal.
 */
export abstract class PrincipalContext<
	TOptions extends AuthenticationSchemeOptions,
> extends PropertiesContext<TOptions> {
	/**
	 * Gets the <see cref="ClaimsPrincipal"/> containing the user claims.
	 */
	principal: ClaimsPrincipal | undefined;

	protected constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		options: TOptions,
		properties: AuthenticationProperties | undefined,
	) {
		super(context, scheme, options, properties);
	}
}
