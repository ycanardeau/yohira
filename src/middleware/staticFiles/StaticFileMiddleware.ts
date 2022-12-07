import { App } from '@/App';
import { IHttpContext } from '@/http/IHttpContext';
import { IMiddleware } from '@/http/IMiddleware';
import { RequestDelegate } from '@/http/RequestDelegate';
import { ILogger } from '@/logging/ILogger';
import { ILoggerFactory } from '@/logging/ILoggerFactory';
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

	invoke = (context: IHttpContext, next: RequestDelegate): Promise<void> => {
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
