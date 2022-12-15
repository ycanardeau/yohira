import { FileExtensionContentTypeProvider } from '@/middleware/staticFiles/FileExtensionContentTypeProvider';
import {
	isGetOrHeadMethod,
	resolveFileProvider,
	tryMatchPath,
} from '@/middleware/staticFiles/Helpers';
import { IContentTypeProvider } from '@/middleware/staticFiles/IContentTypeProvider';
import {
	logEndpointMatched,
	logFileNotFound,
	logFileTypeNotSupported,
	logPathMismatch,
	logRequestMethodNotSupported,
} from '@/middleware/staticFiles/LoggerExtensions';
import { SharedOptionsBase } from '@/middleware/staticFiles/SharedOptionsBase';
import { StaticFileContext } from '@/middleware/staticFiles/StaticFileContext';
import { IFileProvider } from '@yohira/file-providers';
import { IWebHostEnv } from '@yohira/hosting';
import {
	IAppBuilder,
	IHttpContext,
	IMiddleware,
	PathString,
	RequestDelegate,
	getEndpoint,
	useMiddleware,
} from '@yohira/http';
import { ILogger, ILoggerFactory } from '@yohira/logging';
import { IOptions } from '@yohira/options';
import { inject, injectable, named } from 'inversify';
import { Err, Ok, Result } from 'ts-results';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileOptions.cs,fecf371ff955674d,references
export class StaticFileOptions extends SharedOptionsBase {
	/**
	 * Used to map files to content-types.
	 */
	contentTypeProvider!: IContentTypeProvider;
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
	private readonly matchUrl: PathString;
	private readonly logger: ILogger<StaticFileMiddleware>;
	private readonly fileProvider: IFileProvider;
	private readonly contentTypeProvider: IContentTypeProvider;

	constructor(
		@inject(IWebHostEnv) hostingEnv: IWebHostEnv,
		@inject(IOptions)
		@named(StaticFileOptions.name)
		options: IOptions<StaticFileOptions>,
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
	) {
		this.options = options.value;
		this.contentTypeProvider =
			this.options.contentTypeProvider ??
			new FileExtensionContentTypeProvider();
		this.fileProvider =
			this.options.fileProvider ?? resolveFileProvider(hostingEnv);
		this.matchUrl = this.options.requestPath;
		this.logger = loggerFactory.createLogger(StaticFileMiddleware);

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
