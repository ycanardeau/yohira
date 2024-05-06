import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';
import { StringSegment, StringValues } from '@yohira/extensions.primitives';
import { CookieSecurePolicy, IHttpContext } from '@yohira/http.abstractions';
import { CacheControlHeaderValue, HeaderNames } from '@yohira/http.headers';

import { AntiforgeryOptions } from '../AntiforgeryOptions';
import { AntiforgeryTokenSet } from '../AntiforgeryTokenSet';
import { AntiforgeryValidationError } from '../AntiforgeryValidationError';
import { IAntiforgery } from '../IAntiforgery';
import { AntiforgeryFeature } from './AntiforgeryFeature';
import { AntiforgeryToken } from './AntiforgeryToken';
import { IAntiforgeryFeature } from './IAntiforgeryFeature';
import { IAntiforgeryTokenGenerator } from './IAntiforgeryTokenGenerator';
import { IAntiforgeryTokenSerializer } from './IAntiforgeryTokenSerializer';
import { IAntiforgeryTokenStore } from './IAntiforgeryTokenStore';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/AntiforgeryLoggerExtensions.cs,bc3340bc1a8aa4ec,references
function logValidatedAntiforgeryToken(logger: ILogger): void {
	logger.log(LogLevel.Debug, 'Antiforgery successfully validated a request.');
}

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/AntiforgeryLoggerExtensions.cs,97a2a30d107bb425,references
function logNewCookieToken(logger: ILogger): void {
	logger.log(LogLevel.Debug, 'A new antiforgery cookie token was created.');
}

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/AntiforgeryLoggerExtensions.cs,ca0d5133f55fdfda,references
function logReusedCookieToken(logger: ILogger): void {
	logger.log(LogLevel.Debug, 'An antiforgery cookie token was reused.');
}

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/AntiforgeryLoggerExtensions.cs,e10e8963b5634d0d,references
function logTokenDeserializeError(logger: ILogger, error: Error): void {
	logger.log(
		LogLevel.Error,
		'An exception was thrown while deserializing the token.',
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/AntiforgeryLoggerExtensions.cs,5c461edc6de616dd,references
function logResponseCacheHeadersOverriddenToNoCache(logger: ILogger): void {
	logger.log(
		LogLevel.Warning,
		"The 'Cache-Control' and 'Pragma' headers have been overridden and set to 'no-cache, no-store' and " +
			"'no-cache' respectively to prevent caching of this response. Any response that uses antiforgery " +
			'should not be cached.',
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/DefaultAntiforgery.cs,38d318773078c7ae,references
/**
 * Provides access to the antiforgery system, which provides protection against
 * Cross-site Request Forgery (XSRF, also called CSRF) attacks.
 */
export class DefaultAntiforgery implements IAntiforgery {
	private readonly options: AntiforgeryOptions;
	private readonly logger: ILoggerT<DefaultAntiforgery>;

	constructor(
		@inject(Symbol.for('IOptions<AntiforgeryOptions>'))
		antiforgeryOptionsAccessor: IOptions<AntiforgeryOptions>,
		@inject(IAntiforgeryTokenGenerator)
		private readonly tokenGenerator: IAntiforgeryTokenGenerator,
		@inject(IAntiforgeryTokenSerializer)
		private readonly tokenSerializer: IAntiforgeryTokenSerializer,
		@inject(IAntiforgeryTokenStore)
		private readonly tokenStore: IAntiforgeryTokenStore,
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
	) {
		this.options = antiforgeryOptionsAccessor.getValue(AntiforgeryOptions);
		this.logger = loggerFactory.createLogger(DefaultAntiforgery.name);
	}

	private checkSSLConfig(context: IHttpContext): void {
		if (
			this.options.cookie.securePolicy === CookieSecurePolicy.Always &&
			!context.request.isHttps
		) {
			throw new Error(
				`The antiforgery system has the configuration value ${[
					AntiforgeryOptions.name,
					'cookie',
					'securePolicy',
				].join('.')} = ${
					CookieSecurePolicy[CookieSecurePolicy.Always]
				}, but the current request is not an SSL request.` /* LOC */,
			);
		}
	}

	private saveCookieTokenAndHeader(
		httpContext: IHttpContext,
		cookieToken: string,
	): void {
		if (cookieToken !== undefined) {
			// Persist the new cookie if it is not null.
			this.tokenStore.saveCookieToken(httpContext, cookieToken);
		}

		if (
			!this.options.suppressXFrameOptionsHeader &&
			!httpContext.response.headers.hasHeader(
				HeaderNames['X-Frame-Options'],
			)
		) {
			// Adding X-Frame-Options header to prevent ClickJacking. See
			// http://tools.ietf.org/html/draft-ietf-websec-x-frame-options-10
			// for more information.
			httpContext.response.headers.setHeader(
				HeaderNames['X-Frame-Options'],
				'SAMEORIGIN',
			);
		}
	}

	/**
	 * Sets the 'Cache-Control' header to 'no-cache, no-store' and 'Pragma' header to 'no-cache' overriding any user set value.
	 * @param httpContext The {@link IHttpContext}.
	 */
	private setDoNotCacheHeaders(httpContext: IHttpContext): void {
		let logWarning = false;
		const responseHeaders = httpContext.response.headers;

		const cacheControlHeader = responseHeaders.getHeader(
			HeaderNames['Cache-Control'],
		);
		let cacheControlHeaderValue: CacheControlHeaderValue | undefined;
		if (
			CacheControlHeaderValue.tryParse(
				StringSegment.from(cacheControlHeader?.toString()),
				{
					set: (value) => (cacheControlHeaderValue = value),
				},
			)
		) {
			// If the Cache-Control is already set, override it only if required
			if (
				!cacheControlHeaderValue!.noCache ||
				!cacheControlHeaderValue!.noStore
			) {
				logWarning = true;
				responseHeaders.setHeader(
					HeaderNames['Cache-Control'],
					'no-cache, no-store',
				);
			}
		} else {
			responseHeaders.setHeader(
				HeaderNames['Cache-Control'],
				'no-cache, no-store',
			);
		}

		const pragmaHeader = responseHeaders.hasHeader(HeaderNames.Pragma)
			? new StringValues(
					responseHeaders.getHeader(HeaderNames.Pragma) as
						| string
						| string[] /* REVIEw */,
				)
			: undefined;
		if (pragmaHeader !== undefined && pragmaHeader.count > 0) {
			// If the Pragma is already set, override it only if required
			if (
				pragmaHeader.at(0)?.toLowerCase() !== 'no-cache'.toLowerCase()
			) {
				logWarning = true;
				httpContext.response.headers.setHeader(
					HeaderNames.Pragma,
					'no-cache',
				);
			}
		} else {
			httpContext.response.headers.setHeader(
				HeaderNames.Pragma,
				'no-cache',
			);
		}

		// Since antiforgery token generation is not very obvious to the end users (ex: MVC's form tag generates them
		// by default), log a warning to let users know of the change in behavior to any cache headers they might
		// have set explicitly.
		if (logWarning) {
			logResponseCacheHeadersOverriddenToNoCache(this.logger);
		}
	}

	getAndStoreTokens(httpContext: IHttpContext): AntiforgeryTokenSet {
		this.checkSSLConfig(httpContext);

		const antiforgeryFeature = this.getTokensInternal(httpContext);
		const tokenSet = this.serialize(antiforgeryFeature);

		if (!antiforgeryFeature.haveStoredNewCookieToken) {
			if (antiforgeryFeature.newCookieToken !== undefined) {
				// Serialize handles the new cookie token string.
				if (antiforgeryFeature.newCookieTokenString === undefined) {
					throw new Error('Assertion failed.');
				}

				this.saveCookieTokenAndHeader(
					httpContext,
					antiforgeryFeature.newCookieTokenString,
				);
				antiforgeryFeature.haveStoredNewCookieToken = true;
				logNewCookieToken(this.logger);
			} else {
				logReusedCookieToken(this.logger);
			}
		}

		if (!httpContext.response.hasStarted) {
			// Explicitly set the cache headers to 'no-cache'. This could override any user set value but this is fine
			// as a response with antiforgery token must never be cached.
			this.setDoNotCacheHeaders(httpContext);
		}

		return tokenSet;
	}

	private static getAntiforgeryFeature(
		httpContext: IHttpContext,
	): IAntiforgeryFeature {
		let antiforgeryFeature =
			httpContext.features.get<IAntiforgeryFeature>(IAntiforgeryFeature);
		if (antiforgeryFeature === undefined) {
			antiforgeryFeature = new AntiforgeryFeature();
			httpContext.features.set<IAntiforgeryFeature>(
				IAntiforgeryFeature,
				antiforgeryFeature,
			);
		}

		return antiforgeryFeature;
	}

	private getCookieTokenDoesNotThrow(
		httpContext: IHttpContext,
	): AntiforgeryToken | undefined {
		try {
			const serializedToken = this.tokenStore.getCookieToken(httpContext);

			if (serializedToken !== undefined) {
				const token = this.tokenSerializer.deserialize(serializedToken);
				return token;
			}
		} catch (error) {
			if (error instanceof Error) {
				// ignore failures since we'll just generate a new token
				logTokenDeserializeError(this.logger, error);
			} else {
				throw error;
			}
		}

		return undefined;
	}

	private getCookieTokens(httpContext: IHttpContext): IAntiforgeryFeature {
		const antiforgeryFeature =
			DefaultAntiforgery.getAntiforgeryFeature(httpContext);

		if (antiforgeryFeature.haveGeneratedNewCookieToken) {
			if (!antiforgeryFeature.haveDeserializedCookieToken) {
				throw new Error('Assertion failed.');
			}

			// Have executed this method earlier in the context of this request.
			return antiforgeryFeature;
		}

		let cookieToken: AntiforgeryToken | undefined;
		if (antiforgeryFeature.haveDeserializedCookieToken) {
			cookieToken = antiforgeryFeature.cookieToken;
		} else {
			cookieToken = this.getCookieTokenDoesNotThrow(httpContext);

			antiforgeryFeature.cookieToken = cookieToken;
			antiforgeryFeature.haveDeserializedCookieToken = true;
		}

		let newCookieToken: AntiforgeryToken | undefined;
		if (this.tokenGenerator.isCookieTokenValid(cookieToken)) {
			// No need for the cookie token from the request after it has been verified.
			newCookieToken = undefined;
		} else {
			// Need to make sure we're always operating with a good cookie token.
			newCookieToken = this.tokenGenerator.generateCookieToken();
			if (!this.tokenGenerator.isCookieTokenValid(newCookieToken)) {
				throw new Error('Assertion failed.');
			}
		}

		antiforgeryFeature.haveGeneratedNewCookieToken = true;
		antiforgeryFeature.newCookieToken = newCookieToken;

		return antiforgeryFeature;
	}

	private getTokensInternal(httpContext: IHttpContext): IAntiforgeryFeature {
		const antiforgeryFeature = this.getCookieTokens(httpContext);
		if (antiforgeryFeature.newRequestToken === undefined) {
			const cookieToken =
				antiforgeryFeature.newCookieToken ??
				antiforgeryFeature.cookieToken;
			antiforgeryFeature.newRequestToken =
				this.tokenGenerator.generateRequestToken(
					httpContext,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					cookieToken!,
				);
		}

		return antiforgeryFeature;
	}

	private serialize(
		antiforgeryFeature: IAntiforgeryFeature,
	): AntiforgeryTokenSet {
		// Should only be called after new tokens have been generated.
		if (!antiforgeryFeature.haveGeneratedNewCookieToken) {
			throw new Error('Assertion failed.');
		}
		if (antiforgeryFeature.newRequestToken === undefined) {
			throw new Error('Assertion failed.');
		}

		if (antiforgeryFeature.newRequestTokenString === undefined) {
			antiforgeryFeature.newRequestTokenString =
				this.tokenSerializer.serialize(
					antiforgeryFeature.newRequestToken,
				);
		}

		if (
			antiforgeryFeature.newCookieTokenString === undefined &&
			antiforgeryFeature.newCookieToken !== undefined
		) {
			antiforgeryFeature.newCookieTokenString =
				this.tokenSerializer.serialize(
					antiforgeryFeature.newCookieToken,
				);
		}

		return new AntiforgeryTokenSet(
			antiforgeryFeature.newRequestTokenString,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			antiforgeryFeature.newCookieTokenString!,
			this.options.formFieldName,
			this.options.headerName,
		);
	}

	getTokens(httpContext: IHttpContext): AntiforgeryTokenSet {
		this.checkSSLConfig(httpContext);

		const antiforgeryFeature = this.getTokensInternal(httpContext);
		return this.serialize(antiforgeryFeature);
	}

	async isRequestValid(httpContext: IHttpContext): Promise<boolean> {
		this.checkSSLConfig(httpContext);

		// TODO
		throw new Error('Method not implemented.');
	}

	private validateTokens(
		httpContext: IHttpContext,
		antiforgeryTokenSet: AntiforgeryTokenSet,
	): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	async validateRequest(httpContext: IHttpContext): Promise<void> {
		this.checkSSLConfig(httpContext);

		const tokens = await this.tokenStore.getRequestTokens(httpContext);
		if (tokens.cookieToken === undefined) {
			throw new AntiforgeryValidationError(
				`The required antiforgery cookie "${this.options.cookie.name}" is not present.` /* LOC */,
			);
		}

		if (tokens.requestToken === undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		this.validateTokens(httpContext, tokens);

		logValidatedAntiforgeryToken(this.logger);
	}

	setCookieTokenAndHeader(httpContext: IHttpContext): void {
		this.checkSSLConfig(httpContext);

		// TODO
		throw new Error('Method not implemented.');
	}
}
