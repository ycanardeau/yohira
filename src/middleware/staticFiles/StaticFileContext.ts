import { IFileInfo } from '@/fileProviders/IFileInfo';
import { IFileProvider } from '@/fileProviders/IFileProvider';
import { IHttpContext } from '@/http/IHttpContext';
import { IHttpRequest, getTypedHeaders } from '@/http/IHttpRequest';
import { PathString } from '@/http/PathString';
import { RequestDelegate } from '@/http/RequestDelegate';
import { RequestHeaders } from '@/http/RequestHeaders';
import { ILogger } from '@/logging/ILogger';
import {
	StaticFileMiddleware,
	StaticFileOptions,
} from '@/middleware/staticFiles/StaticFileMiddleware';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileContext.cs,24617c4390017df9,references
export class StaticFileContext {
	private readonly request: IHttpRequest;

	private fileInfo: IFileInfo;

	constructor(
		private readonly context: IHttpContext,
		private readonly options: StaticFileOptions,
		private readonly logger: ILogger<StaticFileMiddleware>,
		private readonly fileProvider: IFileProvider,
		private readonly conteType: string | undefined,
		private readonly _subPath: PathString,
	) {
		if (_subPath.value === undefined) {
			throw new Error("Value cannot be undefined. (Parameter 'subPath')");
		}

		this.request = context.request;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.fileInfo = undefined!;
		// TODO
	}

	private _requestHeaders?: RequestHeaders;
	private get requestHeaders(): RequestHeaders {
		return (this._requestHeaders ??= getTypedHeaders(this.request));
	}

	get subPath(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._subPath.value!;
	}

	lookupFileInfo = (): boolean => {
		this.fileInfo = this.fileProvider.getFileInfo(this.subPath);
		if (this.fileInfo.exists) {
			// TODO
		}
		return this.fileInfo.exists;
	};

	serveStaticFile = async (
		context: IHttpContext,
		next: RequestDelegate,
	): Promise<void> => {
		// TODO
	};
}
