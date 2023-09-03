import {
	AuthenticateResult,
	AuthenticationOptions,
	AuthenticationProperties,
	AuthenticationTicket,
	ClaimsPrincipal,
	IAuthenticationHandler,
	IAuthenticationHandlerProvider,
	IAuthenticationSchemeProvider,
	IAuthenticationService,
	IAuthenticationSignInHandler,
	IClaimsTransformation,
} from '@yohira/authentication.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IOptions } from '@yohira/extensions.options';
import { IHttpContext } from '@yohira/http.abstractions';

function isIAuthenticationSignInHandler(
	value: IAuthenticationHandler,
): value is IAuthenticationSignInHandler {
	return 'signIn' in value;
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationService.cs,30159f972b8c22ae,references
/**
 * Implements {@link IAuthenticationService}.
 */
export class AuthenticationService implements IAuthenticationService {
	private transformCache: Set<ClaimsPrincipal> | undefined;

	/**
	 * The {@link AuthenticationOptions}.
	 */
	readonly options: AuthenticationOptions;

	constructor(
		/**
		 * Used to lookup AuthenticationSchemes.
		 */
		@inject(IAuthenticationSchemeProvider)
		readonly schemes: IAuthenticationSchemeProvider,
		/**
		 * Used to resolve IAuthenticationHandler instances.
		 */
		@inject(IAuthenticationHandlerProvider)
		readonly handlers: IAuthenticationHandlerProvider,
		/**
		 * Used for claims transformation.
		 */
		@inject(IClaimsTransformation)
		readonly transform: IClaimsTransformation,
		@inject(Symbol.for('IOptions<AuthenticationOptions>'))
		options: IOptions<AuthenticationOptions>,
	) {
		this.options = options.getValue(AuthenticationOptions);
	}

	private async createMissingHandlerError(scheme: string): Promise<Error> {
		const schemes = Array.from(await this.schemes.getAllSchemes())
			.map((sch) => sch.name)
			.join(', ');

		const footer = ` Did you forget to call AddAuthentication().Add[SomeAuthHandler](\"${scheme}\",...)?`;

		if (!schemes) {
			return new Error(
				`No authentication handlers are registered.${footer}`,
			);
		}

		return new Error(
			`No authentication handler is registered for the scheme '${scheme}'. The registered schemes are: ${schemes}.${footer}`,
		);
	}

	/**
	 * Authenticate for the specified authentication scheme.
	 * @param context The {@link IHttpContext}.
	 * @param scheme The name of the authentication scheme.
	 * @returns The result.
	 */
	async authenticate(
		context: IHttpContext,
		scheme: string | undefined,
	): Promise<AuthenticateResult> {
		if (scheme === undefined) {
			const defaultScheme =
				await this.schemes.getDefaultAuthenticateScheme();
			scheme = defaultScheme?.name;
			if (scheme === undefined) {
				throw new Error(
					'No authenticationScheme was specified, and there was no DefaultAuthenticateScheme found. The default schemes can be set using either AddAuthentication(string defaultScheme) or AddAuthentication(Action<AuthenticationOptions> configureOptions).',
				);
			}
		}

		const handler = await this.handlers.getHandler(context, scheme);
		if (handler === undefined) {
			throw await this.createMissingHandlerError(scheme);
		}

		const result = await handler.authenticate();

		if (result.succeeded) {
			let principal = result.principal!;
			let doTransform = true;
			this.transformCache ??= new Set<ClaimsPrincipal>();
			if (this.transformCache.has(principal)) {
				doTransform = false;
			}

			if (doTransform) {
				principal = await this.transform.transform(principal);
				this.transformCache.add(principal);
			}
			return AuthenticateResult.success(
				new AuthenticationTicket(
					principal,
					result.properties,
					result.ticket!.authenticationScheme,
				),
			);
		}
		return result;
	}

	challenge(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	forbid(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	/**
	 * Sign a principal in for the specified authentication scheme.
	 * @param context The {@link IHttpContext}.
	 * @param scheme The name of the authentication scheme.
	 * @param principal The {@link ClaimsPrincipal} to sign in.
	 * @param properties The {@link AuthenticationProperties}.
	 * @returns A promise.
	 */
	async signIn(
		context: IHttpContext,
		scheme: string | undefined,
		principal: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		if (this.options.requireAuthenticatedSignIn) {
			if (principal.identity === undefined) {
				throw new Error(
					'signIn when principal.identity === undefined is not allowed when AuthenticationOptions.requireAuthenticatedSignIn is true.',
				);
			}
			if (!principal.identity.isAuthenticated) {
				throw new Error(
					'signIn when principal.identity.isAuthenticated is false is not allowed when AuthenticationOptions.requireAuthenticatedSignIn is true.',
				);
			}
		}

		if (scheme === undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		const handler = await this.handlers.getHandler(context, scheme);
		if (handler === undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		if (!isIAuthenticationSignInHandler(handler)) {
			// TODO
			throw new Error('Method not implemented.');
		}

		await handler.signIn(principal, properties);
	}

	signOut(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
