import { SignInAuthenticationHandler } from '@yohira/authentication';
import {
	AuthenticateResult,
	AuthenticationTicket,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { IOptionsMonitor } from '@yohira/extensions.options';
import { ITlsTokenBindingFeature } from '@yohira/http.features';

import { AuthenticateResults } from './AuthenticateResults';
import { CookieAuthenticationEvents } from './CookieAuthenticationEvents';
import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';
import { CookieValidatePrincipalContext } from './CookieValidatePrincipalContext';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieAuthenticationHandler.cs,54c4e5158289a976,references
/**
 * Implementation for the cookie-based authentication handler.
 */
export class CookieAuthenticationHandler extends SignInAuthenticationHandler<CookieAuthenticationOptions> {
	private readCookiePromise: Promise<AuthenticateResult> | undefined;

	constructor(
		@inject(Symbol.for(`IOptionsMonitor<CookieAuthenticationOptions>`))
		optionsMonitor: IOptionsMonitor<CookieAuthenticationOptions>,
		@inject(ILoggerFactory) logger: ILoggerFactory,
	) {
		super(CookieAuthenticationOptions, optionsMonitor, logger);
	}

	protected get events(): CookieAuthenticationEvents {
		return super.events as CookieAuthenticationEvents;
	}
	protected set events(value: CookieAuthenticationEvents) {
		super.events = value;
	}

	private getTlsTokenBinding(): string | undefined {
		const binding = this.context.features
			.get<ITlsTokenBindingFeature>(ITlsTokenBindingFeature)
			?.getProvidedTokenBindingId();
		return binding === undefined
			? undefined
			: Buffer.from(binding).toString('base64');
	}

	private async readCookieTicket(): Promise<AuthenticateResult> {
		const cookie = this.options.cookieManager.getRequestCookie(
			this.context,
			this.options.cookie.name!,
		);
		if (!cookie) {
			return AuthenticateResult.noResult();
		}

		const ticket = this.options.ticketDataFormat.unprotect(
			cookie,
			this.getTlsTokenBinding(),
		);
		if (ticket === undefined) {
			return AuthenticateResults.failedUnprotectingTicket;
		}

		if (this.options.sessionStore !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		const currentUtc = this.timeProvider.getUtcNow();
		const expiresUtc = ticket.properties.expiresUtc;

		if (expiresUtc !== undefined && expiresUtc < currentUtc) {
			// TODO
			throw new Error('Method not implemented.');
		}

		// Finally we have a valid ticket
		return AuthenticateResult.success(ticket);
	}

	private ensureCookieTicket(): Promise<AuthenticateResult> {
		// We only need to read the ticket once
		if (this.readCookiePromise === undefined) {
			this.readCookiePromise = this.readCookieTicket();
		}
		return this.readCookiePromise;
	}

	private checkForRefresh(ticket: AuthenticationTicket): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	private requestRefresh(
		ticket: AuthenticationTicket,
		replacedPrincipal?: ClaimsPrincipal,
	): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	protected async handleAuthenticate(): Promise<AuthenticateResult> {
		const result = await this.ensureCookieTicket();
		if (!result.succeeded) {
			return result;
		}

		// We check this before the ValidatePrincipal event because we want to make sure we capture a clean clone
		// without picking up any per-request modifications to the principal.
		await this.checkForRefresh(result.ticket!);

		if (result.ticket === undefined) {
			throw new Error('Assertion failed.');
		}
		const context = new CookieValidatePrincipalContext(
			this.context,
			this.scheme,
			this.options,
			result.ticket,
		);
		await this.events.validatePrincipal(context);

		if (context.principal === undefined) {
			return AuthenticateResults.noPrincipal;
		}

		if (context.shouldRenew) {
			this.requestRefresh(result.ticket, context.principal);
		}

		return AuthenticateResult.success(
			new AuthenticationTicket(
				context.principal,
				context.properties,
				this.scheme.name,
			),
		);
	}
}
