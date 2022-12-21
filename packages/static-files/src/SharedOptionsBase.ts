import { IFileProvider } from '@yohira/extensions.file-providers/IFileProvider';
import { PathString } from '@yohira/http.abstractions/PathString';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Infrastructure/SharedOptionsBase.cs,cb3c3719df64d2f0,references
export abstract class SharedOptionsBase {
	/**
	 * The relative request path that maps to static resources.
	 * This defaults to the site root '/'.
	 */
	requestPath = PathString.empty;
	/**
	 * The file system used to locate resources
	 * @remarks
	 * Files are served from the path specified in {@link IWebHostEnv.webRootPath}
	 * or {@link IWebHostEnv.webRootFileProvider} which defaults to the 'wwwroot' subfolder.
	 */
	fileProvider?: IFileProvider;
}
