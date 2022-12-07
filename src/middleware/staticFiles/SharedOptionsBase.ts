import { IFileProvider } from '@/fileProviders/IFileProvider';
import { PathString } from '@/http/PathString';

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
	 * Files are served from the path specified in {@link IWebHostEnvironment.webRootPath}
	 * or {@link IWebHostEnvironment.webRootFileProvider} which defaults to the 'wwwroot' subfolder.
	 */
	fileProvider?: IFileProvider;
}
