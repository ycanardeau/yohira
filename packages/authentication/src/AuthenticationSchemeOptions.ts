import { Ctor, TimeProvider } from '@yohira/base';

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
	 * Used for testing.
	 */
	timeProvider?: TimeProvider;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	validate(scheme?: string): void {}
}
