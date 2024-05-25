import {
	AuthenticationProperties,
	AuthenticationScheme,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';
import { BaseContext } from './BaseContext';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/Events/PropertiesContext.cs,e0c14911e714f5d5,references
/**
 * Base context for authentication events which contain {@link AuthenticationProperties}.
 */
export abstract class PropertiesContext<
	TOptions extends AuthenticationSchemeOptions,
> extends BaseContext<TOptions> {
	private _properties!: AuthenticationProperties;
	get properties(): AuthenticationProperties {
		return this._properties;
	}
	protected set properties(value: AuthenticationProperties) {
		this._properties = value;
	}

	protected constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		options: TOptions,
		properties: AuthenticationProperties | undefined,
	) {
		super(context, scheme, options);

		this.properties = properties ?? AuthenticationProperties.create();
	}
}
