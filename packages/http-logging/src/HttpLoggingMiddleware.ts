import { ILoggerT } from '@yohira/extensions.logging.abstractions/ILoggerT';
import { LogLevel } from '@yohira/extensions.logging.abstractions/LogLevel';
import { IOptionsMonitor } from '@yohira/extensions.options/IOptionsMonitor';
import { logRequestLog } from '@yohira/http-logging/HttpLoggingExtensions';
import { HttpLoggingFields } from '@yohira/http-logging/HttpLoggingFields';
import { HttpLoggingOptions } from '@yohira/http-logging/HttpLoggingOptions';
import { HttpRequestLog } from '@yohira/http-logging/HttpRequestLog';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { IMiddleware } from '@yohira/http.abstractions/IMiddleware';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';
import { useMiddleware } from '@yohira/http.abstractions/extensions/UseMiddlewareExtensions';
import { inject } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingMiddleware.cs,35c5841599b94285,references
export class HttpLoggingMiddleware implements IMiddleware {
	constructor(
		@inject('IOptionsMonitor<HttpLoggingOptions>')
		private readonly options: IOptionsMonitor<HttpLoggingOptions>,
		@inject('ILogger<HttpLoggingMiddleware>')
		private readonly logger: ILoggerT<HttpLoggingMiddleware>,
	) {}

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
		const options = this.options.getCurrentValue(HttpLoggingOptions);
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
