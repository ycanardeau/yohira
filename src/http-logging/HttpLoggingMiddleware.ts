import { logRequestLog } from '@/http-logging/HttpLoggingExtensions';
import { HttpLoggingFields } from '@/http-logging/HttpLoggingFields';
import { HttpLoggingOptions } from '@/http-logging/HttpLoggingOptions';
import { HttpRequestLog } from '@/http-logging/HttpRequestLog';
import { IAppBuilder } from '@/http.abstractions/IAppBuilder';
import { IHttpContext } from '@/http.abstractions/IHttpContext';
import { IMiddleware } from '@/http.abstractions/IMiddleware';
import { RequestDelegate } from '@/http.abstractions/RequestDelegate';
import { useMiddleware } from '@/http.abstractions/extensions/UseMiddlewareExtensions';
import { ILogger } from '@/logging.abstractions/ILogger';
import { ILoggerFactory } from '@/logging.abstractions/ILoggerFactory';
import { LogLevel } from '@/logging.abstractions/LogLevel';
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

	private static addToList = (
		list: [string, string | undefined][],
		key: string,
		value: string | undefined,
	): void => {
		list.push([key, value]);
	};

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
			const request = context.request;
			const list: [string, string | undefined][] = [];

			// TODO

			if (
				(options.loggingFields & HttpLoggingFields.RequestMethod) !==
				0
			) {
				HttpLoggingMiddleware.addToList(list, 'method', request.method);
			}

			// TODO

			const httpRequestLog = new HttpRequestLog(list);

			logRequestLog(this.logger, httpRequestLog);
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