import { App } from '@/App';
import { IHttpContext } from '@/http/IHttpContext';
import { IMiddleware } from '@/http/IMiddleware';
import { RequestDelegate } from '@/http/RequestDelegate';
import { ILogger } from '@/logging/ILogger';
import { ILoggerFactory } from '@/logging/ILoggerFactory';
import { isGetOrHeadMethod } from '@/middleware/staticFiles/helpers';
import { logRequestMethodNotSupported } from '@/middleware/staticFiles/loggerExtensions';
import { IOptions } from '@/options/IOptions';
import { Container, inject, injectable, named } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileOptions.cs,fecf371ff955674d,references
export class StaticFileOptions {}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileMiddleware.cs,ae588cf9ea8c8a24,references
@injectable()
export class StaticFileMiddleware implements IMiddleware {
	private readonly options: StaticFileOptions;
	private readonly logger: ILogger;

	constructor(
		@inject(IOptions)
		@named(StaticFileOptions.name)
		options: IOptions<StaticFileOptions>,
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
	) {
		this.options = options.value;
		this.logger = loggerFactory.createLogger(StaticFileMiddleware);
	}

	private static validateMethod = (context: IHttpContext): boolean => {
		return isGetOrHeadMethod(context.request.method);
	};

	invoke = (context: IHttpContext, next: RequestDelegate): Promise<void> => {
		// TODO: validateNoEndpointDelegate
		/* TODO: else */ if (!StaticFileMiddleware.validateMethod(context)) {
			logRequestMethodNotSupported(this.logger, context.request.method);
		}

		return next(context);
	};
}

export const addStaticFiles = (container: Container): void => {
	container.bind(StaticFileMiddleware).toSelf().inSingletonScope();
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileExtensions.cs,d2a2db085a036bf0,references
export const useStaticFiles = (app: App): App => {
	return app.useMiddleware(StaticFileMiddleware);
};
