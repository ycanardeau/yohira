import { App } from '@/App';
import { IHttpContext } from '@/http/IHttpContext';
import { IMiddleware } from '@/http/IMiddleware';
import { RequestDelegate } from '@/http/RequestDelegate';
import { ILogger } from '@/logging/ILogger';
import { ILoggerFactory } from '@/logging/ILoggerFactory';
import { FileExtensionContentTypeProvider } from '@/middleware/staticFiles/FileExtensionContentTypeProvider';
import { IContentTypeProvider } from '@/middleware/staticFiles/IContentTypeProvider';
import { SharedOptionsBase } from '@/middleware/staticFiles/SharedOptionsBase';
import { isGetOrHeadMethod } from '@/middleware/staticFiles/helpers';
import {
	logFileTypeNotSupported,
	logPathMismatch,
	logRequestMethodNotSupported,
} from '@/middleware/staticFiles/loggerExtensions';
import { IOptions } from '@/options/IOptions';
import { Container, inject, injectable, named } from 'inversify';
import { Err, Ok, Result } from 'ts-results';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileOptions.cs,fecf371ff955674d,references
export class StaticFileOptions extends SharedOptionsBase {
	/**
	 * Used to map files to content-types.
	 */
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	contentTypeProvider: IContentTypeProvider = undefined!;
	/**
	 * The default content type for a request if the ContentTypeProvider cannot determine one.
	 * None is provided by default, so the client must determine the format themselves.
	 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7
	 */
	defaultContentType?: string;
	/**
	 * If the file is not a recognized content-type should it be served?
	 * Default: false.
	 */
	serveUnknownFileTypes = false;
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileMiddleware.cs,ae588cf9ea8c8a24,references
@injectable()
export class StaticFileMiddleware implements IMiddleware {
	private readonly options: StaticFileOptions;
	private readonly matchUrl: string;
	private readonly logger: ILogger;
	private readonly contentTypeProvider: IContentTypeProvider;

	constructor(
		@inject(IOptions)
		@named(StaticFileOptions.name)
		options: IOptions<StaticFileOptions>,
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
	) {
		this.options = options.value;
		this.contentTypeProvider =
			this.options.contentTypeProvider ??
			new FileExtensionContentTypeProvider();
		this.matchUrl = this.options.requestPath;
		this.logger = loggerFactory.createLogger(StaticFileMiddleware);
	}

	private static validateMethod = (context: IHttpContext): boolean => {
		return isGetOrHeadMethod(context.request.method);
	};

	private static validatePath = (
		context: IHttpContext,
		matchUrl: string,
	): Result<string, string> => {
		throw new Error('Method not implemented.');
	};

	private static lookupContentType = (
		contentTypeProvider: IContentTypeProvider,
		options: StaticFileOptions,
		subPath: string,
	): Result<string | undefined, undefined> => {
		const result = contentTypeProvider.tryGetContentType(subPath);
		if (result.ok) {
			return Ok(result.val);
		}

		if (options.serveUnknownFileTypes) {
			return Ok(options.defaultContentType);
		}

		return Err(undefined);
	};

	private tryServeStaticFile = (
		context: IHttpContext,
		next: RequestDelegate,
		contentType: string | undefined,
		subPath: string,
	): Promise<void> => {
		// TODO

		return next(context);
	};

	invoke = (context: IHttpContext, next: RequestDelegate): Promise<void> => {
		// TODO: validateNoEndpointDelegate
		/* TODO: else */ if (!StaticFileMiddleware.validateMethod(context)) {
			logRequestMethodNotSupported(this.logger, context.request.method);
		} else {
			const validatePathResult = StaticFileMiddleware.validatePath(
				context,
				this.matchUrl,
			);
			if (!validatePathResult.ok) {
				const subPath = validatePathResult.val;
				logPathMismatch(this.logger, subPath);
			} else {
				const subPath = validatePathResult.val;
				const lookupContentTypeResult =
					StaticFileMiddleware.lookupContentType(
						this.contentTypeProvider,
						this.options,
						subPath,
					);
				if (!lookupContentTypeResult.ok) {
					logFileTypeNotSupported(this.logger, subPath);
				} else {
					const contentType = lookupContentTypeResult.val;
					return this.tryServeStaticFile(
						context,
						next,
						contentType,
						subPath,
					);
				}
			}
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
