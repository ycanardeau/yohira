import { ClaimsPrincipal } from '@yohira/base';

import { AuthenticationProperties } from './AuthenticationProperties';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationTicket.cs,f94b5ee0f273ee26,references
/**
 * Contains user identity information as well as additional authentication state.
 */
export class AuthenticationTicket {
	readonly properties: AuthenticationProperties;

	constructor(
		readonly principal: ClaimsPrincipal,
		properties = AuthenticationProperties.create(),
		readonly authenticationScheme: string,
	) {
		this.properties = properties;
	}
}
