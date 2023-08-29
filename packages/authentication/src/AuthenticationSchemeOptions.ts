import { TimeProvider } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationSchemeOptions.cs,e93e1c52d0d986c1,references
export class AuthenticationSchemeOptions {
	/**
	 * Used for testing.
	 */
	timeProvider?: TimeProvider;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	validate(scheme?: string): void {}
}
