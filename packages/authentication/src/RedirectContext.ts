import {
	AuthenticationProperties,
	AuthenticationScheme,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';
import { PropertiesContext } from './PropertiesContext';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/Events/RedirectContext.cs,95af47333ad844e0,references
/**
 * Context passed for redirect events.
 */
export class RedirectContext<
	TOptions extends AuthenticationSchemeOptions,
> extends PropertiesContext<TOptions> {
	/**
	 * Creates a new context object.
	 * @param context The HTTP request context
	 * @param scheme The scheme data
	 * @param options The handler options
	 * @param properties The {@link AuthenticationProperties}.
	 * @param redirectUri The initial redirect URI
	 */
	constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		options: TOptions,
		properties: AuthenticationProperties,
		/**
		 * Gets or Sets the URI used for the redirect operation.
		 */
		public redirectUri: string,
	) {
		super(context, scheme, options, properties);

		this.properties = properties;
	}
}
