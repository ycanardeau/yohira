import { Type } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerT, LogLevel } from '@yohira/extensions.logging.abstractions';
import { IOptionsMonitor } from '@yohira/extensions.options';
import {
	IAppBuilder,
	IHttpContext,
	IMiddleware,
	RequestDelegate,
	useMiddleware,
} from '@yohira/http.abstractions';

import { logRequestLog } from './HttpLoggingExtensions';
import { HttpLoggingFields } from './HttpLoggingFields';
import { HttpLoggingOptions } from './HttpLoggingOptions';
import { HttpRequestLog } from './HttpRequestLog';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingMiddleware.cs,35c5841599b94285,references
export class HttpLoggingMiddleware implements IMiddleware {
	constructor(
		@inject(Type.from('IOptionsMonitor<HttpLoggingOptions>'))
		private readonly options: IOptionsMonitor<HttpLoggingOptions>,
		@inject(Type.from('ILogger<HttpLoggingMiddleware>'))
		private readonly logger: ILoggerT<HttpLoggingMiddleware>,
	) {}

	private static addToList(
		list: [string, string | undefined][],
		key: string,
		value: string | undefined,
	): void {
		list.push([key, value]);
	}

	private async invokeInternal(
		context: IHttpContext,
		next: RequestDelegate,
	): Promise<void> {
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
	}

	invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		if (!this.logger.isEnabled(LogLevel.Information)) {
			// Logger isn't enabled.
			return next(context);
		}

		return this.invokeInternal(context, next);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingBuilderExtensions.cs,14542a362047cc35
export function useHttpLogging(app: IAppBuilder): IAppBuilder {
	useMiddleware(app, HttpLoggingMiddleware);
	return app;
}
