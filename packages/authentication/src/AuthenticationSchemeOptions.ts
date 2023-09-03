import { Ctor, TimeProvider } from '@yohira/base';
import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationSchemeOptions.cs,e93e1c52d0d986c1,references
export class AuthenticationSchemeOptions {
	/**
	 * Instance used for events
	 */
	events: object | undefined;

	/**
	 * If set, will be used as the service type to get the Events instance instead of the property.
	 */
	eventsCtor: Ctor | undefined;

	/**
	 * If set, this specifies a default scheme that authentication handlers should forward all authentication operations to
	 * by default. The default forwarding logic will check the most specific ForwardAuthenticate/Challenge/Forbid/SignIn/SignOut
	 * setting first, followed by checking the ForwardDefaultSelector, followed by ForwardDefault. The first non undefined result
	 * will be used as the target scheme to forward to.
	 */
	forwardDefault: string | undefined;

	/**
	 * If set, this specifies the target scheme that this scheme should forward AuthenticateAsync calls to.
	 * For example Context.AuthenticateAsync("ThisScheme") => Context.AuthenticateAsync("ForwardAuthenticateValue");
	 * Set the target to the current scheme to disable forwarding and allow normal processing.
	 */
	forwardAuthenticate: string | undefined;

	/**
	 * If set, this specifies the target scheme that this scheme should forward SignInAsync calls to.
	 * For example Context.SignInAsync("ThisScheme") => Context.SignInAsync("ForwardSignInValue");
	 * Set the target to the current scheme to disable forwarding and allow normal processing.
	 */
	forwardSignIn: string | undefined;

	/**
	 * Used for testing.
	 */
	timeProvider: TimeProvider | undefined;

	/**
	 * Used to select a default scheme for the current request that authentication handlers should forward all authentication operations to
	 * by default. The default forwarding logic will check the most specific ForwardAuthenticate/Challenge/Forbid/SignIn/SignOut
	 * setting first, followed by checking the ForwardDefaultSelector, followed by ForwardDefault. The first non undefined result
	 * will be used as the target scheme to forward to.
	 */
	forwardDefaultSelector: ((context: IHttpContext) => string) | undefined;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	validate(scheme?: string): void {}
}
