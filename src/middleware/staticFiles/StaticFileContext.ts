import { IFileInfo } from '@/fileProviders/IFileInfo';
import { IFileProvider } from '@/fileProviders/IFileProvider';
import { isGet, isHead } from '@/http/HttpMethods';
import { IHttpContext } from '@/http/IHttpContext';
import { IHttpRequest, getTypedHeaders } from '@/http/IHttpRequest';
import { IHttpResponse, sendFile } from '@/http/IHttpResponse';
import { PathString } from '@/http/PathString';
import { RequestDelegate } from '@/http/RequestDelegate';
import { RequestHeaders } from '@/http/RequestHeaders';
import { StatusCodes } from '@/http/StatusCodes';
import { ILogger } from '@/logging/ILogger';
import { logFileServed } from '@/middleware/staticFiles/LoggerExtensions';
import {
	StaticFileMiddleware,
	StaticFileOptions,
} from '@/middleware/staticFiles/StaticFileMiddleware';

enum PreconditionState {
	Unspecified,
	NotModified,
	ShouldProcess,
	PreconditionFailed,
}

enum RequestType {
	Unspecified = 0,
	IsHead = 1 << 0,
	IsGet = 1 << 1,
	IsRange = 1 << 2,
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileContext.cs,24617c4390017df9,references
export class StaticFileContext {
	private readonly request: IHttpRequest;
	private readonly response: IHttpResponse;
	private readonly method: string;

	private fileInfo: IFileInfo;

	private length: number;

	private requestType: RequestType;

	constructor(
		private readonly context: IHttpContext,
		private readonly options: StaticFileOptions,
		private readonly logger: ILogger<StaticFileMiddleware>,
		private readonly fileProvider: IFileProvider,
		private readonly contentType: string | undefined,
		private readonly _subPath: PathString,
	) {
		if (_subPath.value === undefined) {
			throw new Error("Value cannot be undefined. (Parameter 'subPath')");
		}

		this.request = context.request;
		this.response = context.response;
		this.method = this.request.method;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.fileInfo = undefined!;
		// TODO

		this.length = 0;

		if (isGet(this.method)) {
			this.requestType = RequestType.IsGet;
		} else if (isHead(this.method)) {
			this.requestType = RequestType.IsHead;
		} else {
			this.requestType = RequestType.Unspecified;
		}
	}

	private _requestHeaders?: RequestHeaders;
	private get requestHeaders(): RequestHeaders {
		return (this._requestHeaders ??= getTypedHeaders(this.request));
	}

	get isHeadMethod(): boolean {
		return (this.requestType & RequestType.IsHead) !== 0;
	}

	get isGetMethod(): boolean {
		return (this.requestType & RequestType.IsGet) !== 0;
	}

	get isRangeRequest(): boolean {
		return (this.requestType & RequestType.IsRange) !== 0;
	}

	get subPath(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._subPath.value!;
	}

	get physicalPath(): string {
		return this.fileInfo.physicalPath ?? '';
	}

	lookupFileInfo = (): boolean => {
		this.fileInfo = this.fileProvider.getFileInfo(this.subPath);
		if (this.fileInfo.exists) {
			this.length = this.fileInfo.length;

			// TODO
		}
		return this.fileInfo.exists;
	};

	private computeIfMatch = (): void => {
		// 14.24 If-Match
		// TODO
		// 14.26 If-None-Match
		// TODO
	};

	private computeIfModifiedSince = (): void => {
		// 14.25 If-Modified-Since
		// TODO
		// 14.28 If-Unmodified-Since
		// TODO
	};

	private computeRange = (): void => {
		// 14.35 Range
		// http://tools.ietf.org/html/draft-ietf-httpbis-p5-range-24
		// TODO
	};

	private computeIfRange = (): void => {
		// 14.27 If-Range
		// TODO
	};

	private comprehendRequestHeaders = (): void => {
		this.computeIfMatch();

		this.computeIfModifiedSince();

		this.computeRange();

		this.computeIfRange();
	};

	private getPreconditionState = (): PreconditionState => {
		return PreconditionState.Unspecified; /* TODO */
	};

	applyResponseHeaders = (statusCode: StatusCodes): Promise<void> => {
		this.response.statusCode = statusCode;
		if (statusCode < StatusCodes.Status400BadRequest) {
			if (this.contentType) {
				this.response.contentType = this.contentType;
			}

			// TODO
		}
		if (statusCode === StatusCodes.Status200OK) {
			// this header is only returned here for 200
			// it already set to the returned range for 206
			// it is not returned for 304, 412, and 416
			// TODO: this.response.contentLength = this.length;
		}

		// TODO
		return Promise.resolve();
	};

	private sendStatus = (statusCode: StatusCodes): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};

	private sendRange = async (): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};

	private send = async (): Promise<void> => {
		// TODO
		await this.applyResponseHeaders(StatusCodes.Status200OK);
		try {
			await sendFile(
				this.context.response,
				this.fileInfo,
				0,
				this.length,
				// TODO: this.context.requestAborted,
			);
		} catch (error) {
			// TODO
			throw error;
		}
	};

	serveStaticFile = async (
		context: IHttpContext,
		next: RequestDelegate,
	): Promise<void> => {
		this.comprehendRequestHeaders();
		switch (this.getPreconditionState()) {
			case PreconditionState.Unspecified:
			case PreconditionState.ShouldProcess:
				if (this.isHeadMethod) {
					await this.sendStatus(StatusCodes.Status200OK);
					return;
				}

				try {
					if (this.isRangeRequest) {
						await this.sendRange();
						return;
					}

					await this.send();
					logFileServed(this.logger, this.subPath, this.physicalPath);
					return;
				} catch (error) {
					// TODO: context.response.clear();
					throw error;
				}
				await next(context);
				return;

			case PreconditionState.NotModified:
				// TODO
				return;

			case PreconditionState.PreconditionFailed:
				// TODO
				return;

			default:
				throw new Error('Method not implemented.');
		}
	};
}
