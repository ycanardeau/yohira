import {
	IDataProtectionProvider,
	IDataProtector,
} from '@yohira/data-protection.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';
import {
	IHttpContext,
	IMiddleware,
	RequestDelegate,
} from '@yohira/http.abstractions';
import { ISessionFeature } from '@yohira/http.features';
import { randomUUID } from 'node:crypto';

import { protectCookie, unprotectCookie } from './CookieProtection';
import { ISessionStore } from './ISessionStore';
import { SessionFeature } from './SessionFeature';
import { SessionOptions } from './SessionOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Session/LoggingExtensions.cs,ccd17c2d95c02fc6,references
function errorClosingTheSession(logger: ILogger): void {
	logger.log(LogLevel.Error, 'Error closing the session.');
}

const sessionKeyLength = 36; // "382c74c3-721d-4f34-80e5-57657b6cbc27"
const returnTrue = (): boolean => true;

// https://source.dot.net/#Microsoft.AspNetCore.Session/SessionMiddleware.cs,3adf355917704498,references
class SessionEstablisher {
	private shouldEstablishSession = false;

	constructor(
		private readonly context: IHttpContext,
		private readonly cookieValue: string,
		private readonly options: SessionOptions,
	) {
		context.response.onStarting(
			SessionEstablisher.onStartingCallback,
			this,
		);
	}

	private setCookie(): void {
		const cookieOptions = this.options.cookie.build(this.context);

		const response = this.context.response;
		response.cookies.append(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.options.cookie.name!,
			this.cookieValue,
			cookieOptions,
		);

		const responseHeaders = response.headers;
		responseHeaders.setHeader('cache-control', 'no-cache,no-store');
		responseHeaders.setHeader('pragma', 'no-cache');
		responseHeaders.setHeader('expires', '-1');
	}

	private static onStartingCallback = (state: object): Promise<void> => {
		const establisher = state as SessionEstablisher;
		if (establisher.shouldEstablishSession) {
			establisher.setCookie();
		}
		return Promise.resolve();
	};

	// Returns true if the session has already been established, or if it still can be because the response has not been sent.
	tryEstablishSession(): boolean {
		return (this.shouldEstablishSession ||=
			!this.context.response.hasStarted);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Session/SessionMiddleware.cs,4e889e4f5c92c52f,references
export class SessionMiddleware implements IMiddleware {
	private readonly options: SessionOptions;
	private readonly logger: ILogger;
	private readonly dataProtector: IDataProtector;

	constructor(
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
		@inject(IDataProtectionProvider)
		dataProtectionProvider: IDataProtectionProvider,
		@inject(ISessionStore) private readonly sessionStore: ISessionStore,
		@inject(Symbol.for('IOptions<SessionOptions>'))
		options: IOptions<SessionOptions>,
	) {
		this.logger = loggerFactory.createLogger(SessionMiddleware.name);
		this.dataProtector = dataProtectionProvider.createProtector(
			SessionMiddleware.name,
		);
		this.options = options.getValue(SessionOptions);
	}

	async invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		let isNewSessionKey = false;
		let tryEstablishSession = returnTrue;
		let cookieValue = context.request.cookies.get(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.options.cookie.name!,
		);
		let sessionKey = unprotectCookie(
			this.dataProtector,
			cookieValue,
			this.logger,
		);
		if (!sessionKey.trim() || sessionKey.length !== sessionKeyLength) {
			function getSessionKey(): string {
				return randomUUID();
			}

			// No valid cookie, new session.
			sessionKey = getSessionKey();

			cookieValue = protectCookie(this.dataProtector, sessionKey);
			const establisher = new SessionEstablisher(
				context,
				cookieValue,
				this.options,
			);
			tryEstablishSession = (): boolean =>
				establisher.tryEstablishSession();
			isNewSessionKey = true;
		}

		const feature = new SessionFeature();
		feature.session = this.sessionStore.create(
			sessionKey,
			// TODO: this.options.idleTimeout,
			// TODO: this.options.ioTimeout,
			tryEstablishSession,
			isNewSessionKey,
		);
		context.features.set(ISessionFeature, feature);

		try {
			await next(context);
		} finally {
			context.features.set(ISessionFeature, undefined);

			if (feature.session !== undefined) {
				try {
					await feature.session.commit();
				} catch (error) {
					// TODO: OperationCanceledException
					errorClosingTheSession(this.logger);
				}
			}
		}
	}
}
