import {
	AuthenticateResult,
	AuthenticationProperties,
	AuthenticationScheme,
	IAuthenticationHandler,
	authenticate,
} from '@yohira/authentication.abstractions';
import { Ctor, TimeProvider, systemTimeProvider } from '@yohira/base';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptionsMonitor } from '@yohira/extensions.options';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/LoggingExtensions.cs,4442b0c31dcf129c,references
function logAuthenticationSchemeAuthenticated(
	logger: ILogger,
	authenticationScheme: string,
): void {
	logger.log(
		LogLevel.Debug,
		`AuthenticationScheme: ${authenticationScheme} was successfully authenticated.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/LoggingExtensions.cs,a298747090e46a0d,references
function logAuthenticationSchemeNotAuthenticated(
	logger: ILogger,
	authenticationScheme: string,
): void {
	logger.log(
		LogLevel.Debug,
		`AuthenticationScheme: ${authenticationScheme} was not authenticated.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/LoggingExtensions.cs,15ca745c76646749,references
function logAuthenticationSchemeNotAuthenticatedWithFailure(
	logger: ILogger,
	authenticationScheme: string,
	failureMessage: string,
): void {
	logger.log(
		LogLevel.Information,
		`${authenticationScheme} was not authenticated. Failure message: ${failureMessage}`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationHandler.cs,eda9767974277610,references
/**
 * An opinionated abstraction for implementing <see cref="IAuthenticationHandler"/>.
 */
export abstract class AuthenticationHandler<
	TOptions extends AuthenticationSchemeOptions,
> implements IAuthenticationHandler
{
	private authenticatePromise: Promise<AuthenticateResult> | undefined;

	private _scheme!: AuthenticationScheme;
	/**
	 * Gets or sets the {@link AuthenticationScheme} associated with this authentication handler.
	 */
	get scheme(): AuthenticationScheme {
		return this._scheme;
	}
	private set scheme(value: AuthenticationScheme) {
		this._scheme = value;
	}

	private _options!: TOptions;
	/**
	 * Gets or sets the options associated with this authentication handler.
	 */
	get options(): TOptions {
		return this._options;
	}
	private set options(value: TOptions) {
		this._options = value;
	}

	private _context!: IHttpContext;
	/**
	 * Gets or sets the {@link IHttpContext}.
	 */
	protected get context(): IHttpContext {
		return this._context;
	}
	private set context(value: IHttpContext) {
		this._context = value;
	}

	/**
	 * Gets the {@link ILogger}.
	 */
	protected readonly logger: ILogger;

	private _timeProvider = systemTimeProvider;
	/**
	 * Gets the current time, primarily for unit testing.
	 */
	protected get timeProvider(): TimeProvider {
		return this._timeProvider;
	}
	private set timeProvider(value: TimeProvider) {
		this._timeProvider = value;
	}

	/**
	 * The handler calls methods on the events which give the application control at certain points where processing is occurring.
	 * If it is not provided a default instance is supplied which does nothing when the methods are called.
	 */
	protected _events: object | undefined;
	protected get events(): object | undefined {
		return this._events;
	}
	protected set events(value: object | undefined) {
		this._events = value;
	}

	protected constructor(
		private readonly optionsCtor: Ctor<TOptions>,
		/**
		 * Gets the {@link IOptionsMonitor{TOptions}} to detect changes to options.
		 */
		protected readonly optionsMonitor: IOptionsMonitor<TOptions>,
		logger: ILoggerFactory,
	) {
		this.logger = logger.createLogger(AuthenticationHandler.name);
	}

	/**
	 * Creates a new instance of the events instance.
	 * @returns A new instance of the events instance.
	 */
	protected createEvents(): Promise<object> {
		return Promise.resolve({});
	}

	/**
	 * Initializes the events object, called once per request by {@link initialize}.
	 */
	protected async initializeEvents(): Promise<void> {
		this.events = this.options.events;
		if (this.options.eventsCtor !== undefined) {
			this.events = getRequiredService(
				this.context.requestServices,
				Symbol.for(this.options.eventsCtor.name),
			);
		}
		this.events ??= await this.createEvents();
	}

	/**
	 * Called after options/events have been initialized for the handler to finish initializing itself.
	 * @returns A promise
	 */
	protected initializeHandler(): Promise<void> {
		return Promise.resolve();
	}

	async initialize(
		scheme: AuthenticationScheme,
		context: IHttpContext,
	): Promise<void> {
		this.scheme = scheme;
		this.context = context;

		this.options = this.optionsMonitor.get(
			this.optionsCtor,
			this.scheme.name,
		);

		this.timeProvider = this.options.timeProvider ?? systemTimeProvider;
		// TODO

		await this.initializeEvents();
		await this.initializeHandler();
	}

	/**
	 * Resolves the scheme that this authentication operation is forwarded to.
	 * @param scheme The scheme to forward. One of ForwardAuthenticate, ForwardChallenge, ForwardForbid, ForwardSignIn, or ForwardSignOut.
	 * @returns The forwarded scheme or undefined.
	 */
	protected resolveTarget(scheme: string | undefined): string | undefined {
		const target =
			scheme ??
			this.options.forwardDefaultSelector?.(this.context) ??
			this.options.forwardDefault;

		// Prevent self targetting
		return target === this.scheme.name /* REVIEW */ ? undefined : target;
	}

	/**
	 * Allows derived types to handle authentication.
	 * @returns The {@link AuthenticateResult}.
	 */
	protected abstract handleAuthenticate(): Promise<AuthenticateResult>;

	/**
	 * Used to ensure HandleAuthenticateAsync is only invoked once. The subsequent calls
	 * will return the same authenticate result.
	 */
	protected handleAuthenticateOnce(): Promise<AuthenticateResult> {
		if (this.authenticatePromise === undefined) {
			this.authenticatePromise = this.handleAuthenticate();
		}

		return this.authenticatePromise;
	}

	async authenticate(): Promise<AuthenticateResult> {
		const target = this.resolveTarget(this.options.forwardAuthenticate);
		if (target !== undefined) {
			return await authenticate(this.context, target);
		}

		// Calling Authenticate more than once should always return the original value.
		const result =
			(await this.handleAuthenticateOnce()) ??
			AuthenticateResult.noResult();
		if (result.failure === undefined) {
			const ticket = result.ticket;
			if (ticket?.principal !== undefined) {
				logAuthenticationSchemeAuthenticated(
					this.logger,
					this.scheme.name,
				);
			} else {
				logAuthenticationSchemeNotAuthenticated(
					this.logger,
					this.scheme.name,
				);
			}
		} else {
			logAuthenticationSchemeNotAuthenticatedWithFailure(
				this.logger,
				this.scheme.name,
				result.failure.message,
			);
		}
		return result;
	}

	challenge(properties: AuthenticationProperties | undefined): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	forbid(properties: AuthenticationProperties | undefined): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
