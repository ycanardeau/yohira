import { IFileProvider } from '@yohira/extensions.file-providers/IFileProvider';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions/ILoggerFactory';
import { ILoggerT } from '@yohira/extensions.logging.abstractions/ILoggerT';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { IWebHostEnv } from '@yohira/hosting.abstractions/IWebHostEnv';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { IMiddleware } from '@yohira/http.abstractions/IMiddleware';
import { PathString } from '@yohira/http.abstractions/PathString';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';
import { useMiddleware } from '@yohira/http.abstractions/extensions/UseMiddlewareExtensions';
import { getEndpoint } from '@yohira/http.abstractions/routing/EndpointHttpContextExtensions';
import { FileExtensionContentTypeProvider } from '@yohira/static-files/FileExtensionContentTypeProvider';
import {
	isGetOrHeadMethod,
	resolveFileProvider,
	tryMatchPath,
} from '@yohira/static-files/Helpers';
import { IContentTypeProvider } from '@yohira/static-files/IContentTypeProvider';
import {
	logEndpointMatched,
	logFileNotFound,
	logFileTypeNotSupported,
	logPathMismatch,
	logRequestMethodNotSupported,
} from '@yohira/static-files/LoggerExtensions';
import { StaticFileContext } from '@yohira/static-files/StaticFileContext';
import { StaticFileOptions } from '@yohira/static-files/StaticFileOptions';
import { inject, injectable } from 'inversify';
import { Err, Ok, Result } from 'ts-results-es';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileMiddleware.cs,ae588cf9ea8c8a24,references
@injectable()
export class StaticFileMiddleware implements IMiddleware {
	private readonly options: StaticFileOptions;
	private readonly matchUrl: PathString;
	private readonly logger: ILoggerT<StaticFileMiddleware>;
	private readonly fileProvider: IFileProvider;
	private readonly contentTypeProvider: IContentTypeProvider;

	constructor(
		@inject('IWebHostEnv') hostingEnv: IWebHostEnv,
		@inject('IOptions<StaticFileOptions>')
		options: IOptions<StaticFileOptions>,
		@inject('ILoggerFactory') loggerFactory: ILoggerFactory,
	) {
		this.options = options.getValue(StaticFileOptions);
		this.contentTypeProvider =
			this.options.contentTypeProvider ??
			new FileExtensionContentTypeProvider();
		this.fileProvider =
			this.options.fileProvider ?? resolveFileProvider(hostingEnv);
		this.matchUrl = this.options.requestPath;
		this.logger = loggerFactory.createLogger(StaticFileMiddleware.name);

		// TODO
	}

	private static validateNoEndpointDelegate = (
		context: IHttpContext,
	): boolean => {
		return getEndpoint(context)?.requestDelegate === undefined;
	};

	private static validateMethod = (context: IHttpContext): boolean => {
		return isGetOrHeadMethod(context.request.method);
	};

	private static validatePath = (
		context: IHttpContext,
		matchUrl: PathString,
	): Result<PathString, PathString> => {
		return tryMatchPath(context, matchUrl, false);
	};

	private static lookupContentType = (
		contentTypeProvider: IContentTypeProvider,
		options: StaticFileOptions,
		subPath: PathString,
	): Result<string | undefined, undefined> => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const result = contentTypeProvider.tryGetContentType(subPath.value!);
		if (result.ok) {
			return new Ok(result.val);
		}

		if (options.serveUnknownFileTypes) {
			return new Ok(options.defaultContentType);
		}

		return new Err(undefined);
	};

	private tryServeStaticFile = (
		context: IHttpContext,
		next: RequestDelegate,
		contentType: string | undefined,
		subPath: PathString,
	): Promise<void> => {
		const fileContext = new StaticFileContext(
			context,
			this.options,
			this.logger,
			this.fileProvider,
			contentType,
			subPath,
		);

		if (!fileContext.lookupFileInfo()) {
			logFileNotFound(this.logger, fileContext.subPath);
		} else {
			return fileContext.serveStaticFile(context, next);
		}

		return next(context);
	};

	invoke = (context: IHttpContext, next: RequestDelegate): Promise<void> => {
		if (!StaticFileMiddleware.validateNoEndpointDelegate(context)) {
			logEndpointMatched(this.logger);
		} else if (!StaticFileMiddleware.validateMethod(context)) {
			logRequestMethodNotSupported(this.logger, context.request.method);
		} else {
			const validatePathResult = StaticFileMiddleware.validatePath(
				context,
				this.matchUrl,
			);
			if (!validatePathResult.ok) {
				const subPath = validatePathResult.val;
				logPathMismatch(this.logger, subPath.toString());
			} else {
				const subPath = validatePathResult.val;
				const lookupContentTypeResult =
					StaticFileMiddleware.lookupContentType(
						this.contentTypeProvider,
						this.options,
						subPath,
					);
				if (!lookupContentTypeResult.ok) {
					logFileTypeNotSupported(this.logger, subPath.toString());
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

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileExtensions.cs,d2a2db085a036bf0,references
export const useStaticFiles = (app: IAppBuilder): IAppBuilder => {
	return useMiddleware(app, StaticFileMiddleware);
};
