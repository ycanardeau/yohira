import {
	RedirectContext,
	SignInAuthenticationHandler,
} from '@yohira/authentication';
import {
	AuthenticateResult,
	AuthenticationProperties,
	AuthenticationTicket,
} from '@yohira/authentication.abstractions';
import { ClaimsPrincipal, TimeSpan } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptionsMonitor } from '@yohira/extensions.options';
import { StatusCodes } from '@yohira/http.abstractions';
import { CookieOptions, ITlsTokenBindingFeature } from '@yohira/http.features';
import { HeaderNames } from '@yohira/http.headers';

import { AuthenticateResults } from './AuthenticateResults';
import { CookieAuthenticationEvents } from './CookieAuthenticationEvents';
import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';
import { CookieSignedInContext } from './CookieSignedInContext';
import { CookieSigningInContext } from './CookieSigningInContext';
import { CookieSigningOutContext } from './CookieSigningOutContext';
import { CookieSlidingExpirationContext } from './CookieSlidingExpirationContext';
import { CookieValidatePrincipalContext } from './CookieValidatePrincipalContext';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/LoggingExtensions.cs,9a9b6924411cb67e,references
function logAuthenticationSchemeSignedIn(
	logger: ILogger,
	authenticationScheme: string,
): void {
	logger.log(
		LogLevel.Information,
		`AuthenticationScheme: ${authenticationScheme} signed in.`,
	);
}

function logAuthenticationSchemeSignedOut(
	logger: ILogger,
	authenticationScheme: string,
): void {
	logger.log(
		LogLevel.Information,
		`AuthenticationScheme: ${authenticationScheme} signed out.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieAuthenticationHandler.cs,54c4e5158289a976,references
/**
 * Implementation for the cookie-based authentication handler.
 */
export class CookieAuthenticationHandler extends SignInAuthenticationHandler<CookieAuthenticationOptions> {
	private static readonly headerValueNoCache = 'no-cache';
	private static readonly headerValueNoCacheNoStore = 'no-cache,no-store';
	private static readonly headerValueEpocDate =
		'Thu, 01 Jan 1970 00:00:00 GMT';

	private signInCalled = false;
	private signOutCalled = false;

	private sessionKey: string | undefined;

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
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

	private requestRefresh(
		ticket: AuthenticationTicket,
		replacedPrincipal?: ClaimsPrincipal,
	): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private async checkForRefresh(ticket: AuthenticationTicket): Promise<void> {
		const currentUtc = this.timeProvider.getUtcNow();
		const issuedUtc = ticket.properties.issuedUtc;
		const expiresUtc = ticket.properties.expiresUtc;
		const allowRefresh = ticket.properties.allowRefresh ?? true;
		if (
			issuedUtc !== undefined &&
			expiresUtc !== undefined &&
			this.options.slidingExpiration &&
			allowRefresh
		) {
			const timeElapsed = TimeSpan.fromMilliseconds(
				currentUtc - issuedUtc,
			);
			const timeRemaining = TimeSpan.fromMilliseconds(
				expiresUtc - currentUtc,
			);

			const eventContext = new CookieSlidingExpirationContext(
				this.context,
				this.scheme,
				this.options,
				ticket,
				timeElapsed,
				timeRemaining,
			);
			await this.events.checkSlidingExpiration(eventContext);

			if (eventContext.shouldRenew) {
				this.requestRefresh(ticket);
			}
		}
	}

	protected async handleAuthenticate(): Promise<AuthenticateResult> {
		const result = await this.ensureCookieTicket();
		if (!result.succeeded) {
			return result;
		}

		// We check this before the ValidatePrincipal event because we want to make sure we capture a clean clone
		// without picking up any per-request modifications to the principal.
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

	private buildCookieOptions(): CookieOptions {
		const cookieOptions = this.options.cookie.build(this.context);
		// ignore the 'Expires' value as this will be computed elsewhere
		cookieOptions.expires = undefined;

		return cookieOptions;
	}

	private static isHostRelative(path: string): boolean {
		if (!path) {
			return false;
		}
		if (path.length === 1) {
			return path[0] === '/';
		}
		return path[0] === '/' && path[1] !== '/' && path[1] !== '\\';
	}

	private async applyHeaders(
		shouldRedirect: boolean,
		shouldHonorReturnUrlParameter: boolean,
		properties: AuthenticationProperties,
	): Promise<void> {
		this.response.headers.setHeader(
			HeaderNames['Cache-Control'],
			CookieAuthenticationHandler.headerValueNoCacheNoStore,
		);
		this.response.headers.setHeader(
			HeaderNames.Pragma,
			CookieAuthenticationHandler.headerValueNoCache,
		);
		this.response.headers.setHeader(
			HeaderNames.Expires,
			CookieAuthenticationHandler.headerValueEpocDate,
		);

		if (
			shouldRedirect &&
			this.response.statusCode === StatusCodes.Status200OK
		) {
			// set redirect uri in order:
			// 1. properties.RedirectUri
			// 2. query parameter ReturnUrlParameter (if the request path matches the path set in the options)
			//
			// Absolute uri is not allowed if it is from query string as query string is not
			// a trusted source.
			const redirectUri = properties.redirectUri;
			if (shouldHonorReturnUrlParameter && !redirectUri) {
				/* TODO: redirectUri = this.request.query.get(
					this.options.returnUrlParameter,
				);
				if (
					!redirectUri ||
					!CookieAuthenticationHandler.isHostRelative(redirectUri)
				) {
					redirectUri = undefined;
				} */
				throw new Error('Method not implemented.');
			}

			if (redirectUri !== undefined) {
				await this.events.redirectToReturnUrl(
					new RedirectContext<CookieAuthenticationOptions>(
						this.context,
						this.scheme,
						this.options,
						properties,
						redirectUri,
					),
				);
			}
		}
	}

	protected async handleSignIn(
		user: ClaimsPrincipal,
		properties: AuthenticationProperties = new AuthenticationProperties(
			undefined,
			undefined,
		),
	): Promise<void> {
		this.signInCalled = true;

		// Process the request cookie to initialize members like _sessionKey.
		await this.ensureCookieTicket();
		const cookieOptions = this.buildCookieOptions();

		const signInContext = new CookieSigningInContext(
			this.context,
			this.scheme,
			this.options,
			user,
			properties,
			cookieOptions,
		);

		let issuedUtc: number; /* REVIEW */
		if (signInContext.properties.issuedUtc !== undefined) {
			issuedUtc = signInContext.properties.issuedUtc;
		} else {
			issuedUtc = this.timeProvider.getUtcNow();
			signInContext.properties.issuedUtc = issuedUtc;
		}

		if (signInContext.properties.expiresUtc === undefined) {
			signInContext.properties.expiresUtc =
				issuedUtc + this.options.expireTimeSpan.totalMilliseconds;
		}

		await this.events.signingIn(signInContext);

		if (signInContext.properties.isPersistent) {
			const expiresUtc =
				signInContext.properties.expiresUtc ??
				issuedUtc + this.options.expireTimeSpan.totalMilliseconds;
			signInContext.cookieOptions.expires = expiresUtc;
		}

		const ticket = new AuthenticationTicket(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			signInContext.principal!,
			signInContext.properties,
			signInContext.scheme.name,
		);

		if (this.options.sessionStore !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		const cookieValue = this.options.ticketDataFormat.protect(
			ticket,
			this.getTlsTokenBinding(),
		);

		this.options.cookieManager.appendResponseCookie(
			this.context,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.options.cookie.name!,
			cookieValue,
			signInContext.cookieOptions,
		);

		const signedInContext = new CookieSignedInContext(
			this.context,
			this.scheme,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			signInContext.principal!,
			signInContext.properties,
			this.options,
		);

		await this.events.signedIn(signedInContext);

		// Only honor the ReturnUrl query string parameter on the login path
		const shouldHonorReturnUrlParameter =
			this.options.loginPath !== undefined &&
			this.originalPath.equals(this.options.loginPath);
		await this.applyHeaders(
			true,
			shouldHonorReturnUrlParameter,
			signedInContext.properties,
		);

		logAuthenticationSchemeSignedIn(this.logger, this.scheme.name);
	}

	protected async handleSignOut(
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		properties =
			properties ?? new AuthenticationProperties(undefined, undefined);

		this.signOutCalled = true;

		// Process the request cookie to initialize members like _sessionKey.
		await this.ensureCookieTicket();
		const cookieOptions = this.buildCookieOptions();
		if (
			this.options.sessionStore !== undefined &&
			this.sessionKey !== undefined
		) {
			await this.options.sessionStore.remove(
				this.sessionKey,
				this.context,
				// TODO: this.context.requestAborted,
			);
		}

		const context = new CookieSigningOutContext(
			this.context,
			this.scheme,
			this.options,
			properties,
			cookieOptions,
		);

		await this.events.signingOut(context);

		this.options.cookieManager.deleteCookie(
			this.context,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.options.cookie.name!,
			context.cookieOptions,
		);

		// Only honor the ReturnUrl query string parameter on the logout path
		const shouldHonorReturnUrlParameter =
			this.options.logoutPath !== undefined &&
			this.originalPath === this.options.logoutPath;
		await this.applyHeaders(
			true,
			shouldHonorReturnUrlParameter,
			context.properties,
		);

		logAuthenticationSchemeSignedOut(this.logger, this.scheme.name);
	}
}
