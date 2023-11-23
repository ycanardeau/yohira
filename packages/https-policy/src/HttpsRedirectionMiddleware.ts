import { Lazy } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';
import {
	HostString,
	IHttpContext,
	IMiddleware,
	RequestDelegate,
	StatusCodes,
} from '@yohira/http.abstractions';
import { buildAbsolute } from '@yohira/http.extensions';

import { HttpsRedirectionOptions } from './HttpsRedirectionOptions';

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HttpsLoggingExtensions.cs,906efd4377528098,references
function logRedirectingToHttps(logger: ILogger, redirect: string): void {
	logger.log(LogLevel.Debug, `Redirecting to '${redirect}'.`);
}

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HttpsRedirectionMiddleware.cs,a12a266ff31fd244,references
/**
 * Middleware that redirects non-HTTPS requests to an HTTPS URL.
 */
export class HttpsRedirectionMiddleware implements IMiddleware {
	private static readonly PortNotFound = -1;

	private readonly httpsPort: Lazy<number>;
	private readonly statusCode: StatusCodes;

	private readonly logger: ILogger;

	//  Returns PortNotFound (-1) if we were unable to determine the port.
	private tryGetHttpsPort(): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	constructor(
		@inject(Symbol.for('IOptions<HttpsRedirectionOptions>'))
		options: IOptions<HttpsRedirectionOptions>,
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
	) {
		// TODO

		const httpsRedirectionOptions = options.getValue(
			HttpsRedirectionOptions,
		);
		if (httpsRedirectionOptions.httpsPort !== undefined) {
			this.httpsPort = Lazy.from(httpsRedirectionOptions.httpsPort);
		} else {
			this.httpsPort = new Lazy(this.tryGetHttpsPort);
		}
		this.statusCode = httpsRedirectionOptions.redirectStatusCode;
		this.logger = loggerFactory.createLogger(
			HttpsRedirectionMiddleware.name,
		);
	}

	invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		if (context.request.isHttps) {
			return next(context);
		}

		const port = this.httpsPort.value;
		if (port === HttpsRedirectionMiddleware.PortNotFound) {
			return next(context);
		}

		let host = context.request.host;
		if (port !== 443) {
			host = HostString.fromHostAndPort(host.host, port);
		} else {
			host = new HostString(host.host);
		}

		const request = context.request;
		const redirectUrl = buildAbsolute(
			'https',
			host,
			request.pathBase,
			request.path,
			request.queryString,
		);

		context.response.statusCode = this.statusCode;
		context.response.headers.setHeader('location', redirectUrl);

		logRedirectingToHttps(this.logger, redirectUrl);

		return Promise.resolve();
	}
}
