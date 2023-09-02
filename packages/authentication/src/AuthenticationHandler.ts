import {
	AuthenticateResult,
	AuthenticationProperties,
	AuthenticationScheme,
	IAuthenticationHandler,
} from '@yohira/authentication.abstractions';
import { Ctor, TimeProvider, systemTimeProvider } from '@yohira/base';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { IOptionsMonitor } from '@yohira/extensions.options';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationHandler.cs,eda9767974277610,references
/**
 * An opinionated abstraction for implementing <see cref="IAuthenticationHandler"/>.
 */
export abstract class AuthenticationHandler<
	TOptions extends AuthenticationSchemeOptions,
> implements IAuthenticationHandler
{
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
	protected events: object | undefined;

	protected constructor(
		private readonly optionsCtor: Ctor<TOptions>,
		/**
		 * Gets the {@link IOptionsMonitor{TOptions}} to detect changes to options.
		 */
		protected readonly optionsMonitor: IOptionsMonitor<TOptions>,
	) {}

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

	authenticate(): Promise<AuthenticateResult> {
		// TODO
		throw new Error('Method not implemented.');
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
