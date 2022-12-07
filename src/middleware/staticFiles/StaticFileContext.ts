import { IFileInfo } from '@/fileProviders/IFileInfo';
import { IFileProvider } from '@/fileProviders/IFileProvider';
import { IHttpContext } from '@/http/IHttpContext';
import { PathString } from '@/http/PathString';
import { RequestDelegate } from '@/http/RequestDelegate';
import { ILogger } from '@/logging/ILogger';
import { StaticFileOptions } from '@/middleware/staticFiles/StaticFileMiddleware';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileContext.cs,24617c4390017df9,references
export class StaticFileContext {
	private fileInfo: IFileInfo;

	constructor(
		private readonly context: IHttpContext,
		private readonly options: StaticFileOptions,
		private readonly logger: ILogger,
		private readonly fileProvider: IFileProvider,
		private readonly conteType: string | undefined,
		private readonly _subPath: PathString,
	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.fileInfo = undefined!;
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
