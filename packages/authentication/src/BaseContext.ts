import { AuthenticationScheme } from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/Events/BaseContext.cs,d9f788a0175eead0,references
/**
 * Base class used by other context classes.
 */
export abstract class BaseContext<
	TOptions extends AuthenticationSchemeOptions,
> {
	protected constructor(
		/**
		 * The context.
		 */
		readonly httpContext: IHttpContext,
		/**
		 * The authentication scheme.
		 */
		readonly scheme: AuthenticationScheme,
		/**
		 * Gets the authentication options associated with the scheme.
		 */
		readonly options: TOptions,
	) {}
}
