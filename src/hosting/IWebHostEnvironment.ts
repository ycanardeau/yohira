import { IFileProvider } from '@/fileProviders/IFileProvider';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/IWebHostEnvironment.cs,30ac66307b7b40c9,references
export const IWebHostEnvironment = Symbol.for('IWebHostEnvironment');
export interface IWebHostEnvironment /* TODO: extends IHostEnvironment */ {
	/**
	 * Gets or sets the absolute path to the directory that contains the web-servable application content files.
	 * This defaults to the 'wwwroot' subfolder.
	 */
	webRootPath: string;
	/**
	 * Gets or sets an {@link IFileProvider} pointing at {@link WebRootPath}.
	 * This defaults to referencing files from the 'wwwroot' subfolder.
	 */
	webRootFileProvider: IFileProvider;
}
