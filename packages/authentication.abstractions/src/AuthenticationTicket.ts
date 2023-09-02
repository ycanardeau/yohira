// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationTicket.cs,f94b5ee0f273ee26,references
import { AuthenticationProperties } from './AuthenticationProperties';
import { ClaimsPrincipal } from './ClaimsPrincipal';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationTicket.cs,f94b5ee0f273ee26,references
/**
 * Contains user identity information as well as additional authentication state.
 */
export class AuthenticationTicket {
	constructor(
		readonly principal: ClaimsPrincipal,
		readonly properties = new AuthenticationProperties(
			undefined,
			undefined,
		),
		readonly authenticationScheme: string,
	) {}
}
