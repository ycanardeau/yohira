import {
	AuthenticateResult,
	AuthenticationProperties,
	AuthenticationTicket,
	ClaimsPrincipal,
	IAuthenticationHandlerProvider,
	IAuthenticationSchemeProvider,
	IAuthenticationService,
	IClaimsTransformation,
} from '@yohira/authentication.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationService.cs,30159f972b8c22ae,references
/**
 * Implements {@link IAuthenticationService}.
 */
export class AuthenticationService implements IAuthenticationService {
	private transformCache: Set<ClaimsPrincipal> | undefined;

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
	) {}

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

	signIn(
		context: IHttpContext,
		scheme: string | undefined,
		principal: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
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
