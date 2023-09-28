import { Ctor } from '@yohira/base';

import { AuthenticationScheme } from './AuthenticationScheme';
import { IAuthenticationHandler } from './IAuthenticationHandler';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationSchemeBuilder.cs,e25530a4465ba9e9,references
/**
 * Used to build {@link AuthenticationScheme}s.
 */
export class AuthenticationSchemeBuilder {
	/**
	 * Gets or sets the display name for the scheme being built.
	 */
	displayName: string | undefined;

	/**
	 * Gets or sets the {@link IAuthenticationHandler} type responsible for this scheme.
	 */
	handlerCtor: Ctor<IAuthenticationHandler> | undefined;

	constructor(
		/**
		 * Gets the name of the scheme being built.
		 */
		readonly name: string,
	) {}

	build(): AuthenticationScheme {
		if (this.handlerCtor === undefined) {
			throw new Error(
				'handlerCtor must be configured to build an AuthenticationScheme.',
			);
		}

		return new AuthenticationScheme(
			this.name,
			this.displayName,
			this.handlerCtor,
		);
	}
}
