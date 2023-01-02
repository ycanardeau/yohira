import { IFileProvider } from '@yohira/extensions.file-providers/IFileProvider';
import { IHostEnv } from '@yohira/extensions.hosting.abstractions/IHostEnv';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/IWebHostEnvironment.cs,30ac66307b7b40c9,references
export interface IWebHostEnv extends IHostEnv {
	/**
	 * Gets or sets the absolute path to the directory that contains the web-servable application content files.
	 * This defaults to the 'wwwroot' subfolder.
	 */
	webRootPath: string;
	/**
	 * Gets or sets an {@link IFileProvider} pointing at {@link IWebHostEnv.webRootPath}.
	 * This defaults to referencing files from the 'wwwroot' subfolder.
	 */
	webRootFileProvider: IFileProvider;
}
