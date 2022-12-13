import { IAppBuilder, useMiddleware } from '@/http/IAppBuilder';
import { IHttpContext } from '@/http/IHttpContext';
import { IMiddleware } from '@/http/IMiddleware';
import { RequestDelegate } from '@/http/RequestDelegate';
import { ILogger } from '@/logging/ILogger';
import { ILoggerFactory } from '@/logging/ILoggerFactory';
import { LogLevel } from '@/logging/LogLevel';
import { HttpLoggingFields } from '@/middleware/httpLogging/HttpLoggingFields';
import { HttpLoggingOptions } from '@/middleware/httpLogging/HttpLoggingOptions';
import { IOptionsMonitor } from '@/options/IOptionsMonitor';
import { inject, injectable, named } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingMiddleware.cs,35c5841599b94285,references
@injectable()
export class HttpLoggingMiddleware implements IMiddleware {
	private readonly logger: ILogger<HttpLoggingMiddleware>;

	constructor(
		@inject(IOptionsMonitor)
		@named(HttpLoggingOptions.name)
		private readonly options: IOptionsMonitor<HttpLoggingOptions>,
		@inject(ILoggerFactory)
		loggerFactory: ILoggerFactory /* TODO: ILogger */,
	) {
		this.logger = loggerFactory.createLogger(HttpLoggingMiddleware);
	}

	private invokeInternal = async (
		context: IHttpContext,
		next: RequestDelegate,
	): Promise<void> => {
		const options = this.options.currentValue;
		// TODO

		if (
			(HttpLoggingFields.Request & options.loggingFields) !==
			HttpLoggingFields.None
		) {
			// TODO
		}

		// TODO

		try {
			// TODO

			await next(context);

			// TODO
		} finally {
			// TODO
		}
	};

	invoke = (context: IHttpContext, next: RequestDelegate): Promise<void> => {
		if (!this.logger.isEnabled(LogLevel.Information)) {
			// Logger isn't enabled.
			return next(context);
		}

		return this.invokeInternal(context, next);
	};
}

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingBuilderExtensions.cs,14542a362047cc35
export const useHttpLogging = (app: IAppBuilder): IAppBuilder => {
	useMiddleware(app, HttpLoggingMiddleware);
	return app;
};
