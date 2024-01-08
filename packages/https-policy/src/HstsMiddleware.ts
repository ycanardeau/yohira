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
import { HeaderNames } from '@yohira/http.headers';

import { HstsOptions } from './HstsOptions';

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HstsLoggingExtensions.cs,6ff6a66bf262a2b5,references
function skippingInsecure(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'The request is insecure. Skipping HSTS header.',
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HstsLoggingExtensions.cs,60dbc7b36e8f4f6d,references
function skippingExcludedHost(logger: ILogger, host: string): void {
	logger.log(
		LogLevel.Debug,
		`The host '${host}' is excluded. Skipping HSTS header.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HstsLoggingExtensions.cs,dd532eccec518a56,references
function addingHstsHeader(logger: ILogger): void {
	logger.log(LogLevel.Trace, 'Adding HSTS header to response.');
}

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HstsMiddleware.cs,1dae25c69cf3e931,references
export class HstsMiddleware implements IMiddleware {
	private static readonly includeSubDomains = '; includeSubDomains';
	private static readonly preload = '; preload';

	private readonly strictTransportSecurityValue: string;
	private readonly excludedHosts: string[];
	private readonly logger: ILogger;

	constructor(
		@inject(Symbol.for('IOptions<HstsOptions>'))
		options: IOptions<HstsOptions>,
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
	) {
		const hstsOptions = options.getValue(HstsOptions);
		const maxAge = Math.round(Math.floor(hstsOptions.maxAge.totalSeconds));
		const includeSubdomains = hstsOptions.includeSubDomains
			? HstsMiddleware.includeSubDomains
			: '';
		const preload = hstsOptions.preload ? HstsMiddleware.preload : '';
		this.strictTransportSecurityValue = `max-age=${maxAge}${includeSubdomains}${preload}`;
		this.excludedHosts = hstsOptions.excludedHosts;
		this.logger = loggerFactory.createLogger(HstsMiddleware.name);
	}

	private isHostExcluded(host: string): boolean {
		for (let i = 0; i < this.excludedHosts.length; i++) {
			if (host.toLowerCase() === this.excludedHosts[i].toLowerCase()) {
				return true;
			}
		}

		return false;
	}

	invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		if (!context.request.isHttps) {
			skippingInsecure(this.logger);
			return next(context);
		}

		if (this.isHostExcluded(context.request.host.host)) {
			skippingExcludedHost(this.logger, context.request.host.host);
			return next(context);
		}

		context.response.headers.setHeader(
			HeaderNames['Strict-Transport-Security'],
			this.strictTransportSecurityValue,
		);
		addingHstsHeader(this.logger);

		return next(context);
	}
}
