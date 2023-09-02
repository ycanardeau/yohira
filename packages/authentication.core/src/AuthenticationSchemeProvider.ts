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

		for (const builder of this.options.schemes) {
			const scheme = builder.build();
			this.addScheme(scheme);
		}
	}

	getAllSchemes(): Promise<Iterable<AuthenticationScheme>> {
		// TODO
		throw new Error('Method not implemented.');
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

	tryAddScheme(scheme: AuthenticationScheme): boolean {
		if (this.schemes.has(scheme.name)) {
			return false;
		}
		// REVIEW: lock
		{
			if (this.schemes.has(scheme.name)) {
				return false;
			}
			// TODO
			this.schemes.set(scheme.name, scheme);
			// TODO

			return true;
		}
	}

	addScheme(scheme: AuthenticationScheme): void {
		if (this.schemes.has(scheme.name)) {
			throw new Error(`Scheme already exists: ${scheme.name}`);
		}
		// REVIEW: lock
		{
			if (!this.tryAddScheme(scheme)) {
				throw new Error(`Scheme already exists: ${scheme.name}`);
			}
		}
	}
}
