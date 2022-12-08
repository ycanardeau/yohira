import { IFileProvider } from '@/fileProviders/IFileProvider';
import { NullFileProvider } from '@/fileProviders/NullFileProvider';
import { PhysicalFileProvider } from '@/fileProviders/PhysicalFileProvider';
import { IHostEnv } from '@/hosting/IHostEnv';
import { WebHostOptions } from '@/hosting/WebHostOptions';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/IWebHostEnvironment.cs,30ac66307b7b40c9,references
export const IWebHostEnv = Symbol.for('IWebHostEnv');
export interface IWebHostEnv extends IHostEnv {
	/**
	 * Gets or sets the absolute path to the directory that contains the web-servable application content files.
	 * This defaults to the 'wwwroot' subfolder.
	 */
	webRootPath: string;
	/**
	 * Gets or sets an {@link IFileProvider} pointing at {@link webRootPath}.
	 * This defaults to referencing files from the 'wwwroot' subfolder.
	 */
	webRootFileProvider: IFileProvider;
}

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironmentExtensions.cs,cfa8d9a4a73c54e3
export const initialize = (
	hostingEnv: IWebHostEnv,
	contentRootPath: string,
	options: WebHostOptions,
): void => {
	// TODO

	// TODO: hostingEnv.appName =
	hostingEnv.contentRootPath = contentRootPath;
	// TODO: hostingEnv.contentRootFileProvider =

	const webRoot = options.webRoot;
	if (webRoot === undefined) {
		const wwwroot = resolve(hostingEnv.contentRootPath, 'wwwroot');
		if (existsSync(wwwroot)) {
			hostingEnv.webRootPath = wwwroot;
		}
	} else {
		hostingEnv.webRootPath = resolve(hostingEnv.contentRootPath, webRoot);
	}

	if (hostingEnv.webRootPath) {
		// TODO: hostingEnv.webRootPath = getFullPath(hostingEnv.webRootPath);
		/* TODO: if (!Directory.exists(hostingEnv.webRootPath)) {
			Directory.createDirectory(hostingEnv.webRootPath);
		}*/
		hostingEnv.webRootFileProvider = new PhysicalFileProvider(
			hostingEnv.webRootPath,
		);
	} else {
		hostingEnv.webRootFileProvider = new NullFileProvider();
	}

	// TODO
};
