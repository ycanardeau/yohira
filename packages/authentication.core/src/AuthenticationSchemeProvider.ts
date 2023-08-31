import {
	AuthenticationOptions,
	AuthenticationScheme,
	IAuthenticationSchemeProvider,
} from '@yohira/authentication.abstractions';
import { tryGetValue } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IOptions } from '@yohira/extensions.options';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationSchemeProvider.cs,cac9c9f001bfcd80,references
/**
 * Implements {@link IAuthenticationSchemeProvider}.
 */
export class AuthenticationSchemeProvider
	implements IAuthenticationSchemeProvider
{
	private readonly options: AuthenticationOptions;

	private readonly schemes: Map<string, AuthenticationScheme>;
	private static readonly nullScheme = Promise.resolve<
		AuthenticationScheme | undefined
	>(undefined);
	private autoDefaultScheme = AuthenticationSchemeProvider.nullScheme;

	// Used as a safe return value for enumeration apis
	private requestHandlersCopy: AuthenticationScheme[] = [];

	constructor(
		@inject(Symbol.for('IOptions<AuthenticationOptions>'))
		options: IOptions<AuthenticationOptions>,
	) {
		this.options = options.getValue(AuthenticationOptions);

		this.schemes = new Map();
		// TODO

		// TODO
	}

	getScheme(name: string): Promise<AuthenticationScheme | undefined> {
		const tryGetValueResult = tryGetValue(this.schemes, name);
		return Promise.resolve(
			tryGetValueResult.ok ? tryGetValueResult.val : undefined,
		);
	}

	private getDefaultScheme(): Promise<AuthenticationScheme | undefined> {
		return this.options.defaultScheme !== undefined
			? this.getScheme(this.options.defaultScheme)
			: this.autoDefaultScheme;
	}

	getDefaultAuthenticateScheme(): Promise<AuthenticationScheme | undefined> {
		return this.options.defaultAuthenticateScheme !== undefined
			? this.getScheme(this.options.defaultAuthenticateScheme)
			: this.getDefaultScheme();
	}

	getRequestHandlerSchemes(): Promise<Iterable<AuthenticationScheme>> {
		return Promise.resolve(this.requestHandlersCopy);
	}
}
