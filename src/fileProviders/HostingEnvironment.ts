import { IFileProvider } from '@/fileProviders/IFileProvider';
import { NullFileProvider } from '@/fileProviders/NullFileProvider';
import { PhysicalFileProvider } from '@/fileProviders/PhysicalFileProvider';
import { IWebHostEnvironment } from '@/hosting/IWebHostEnvironment';
import { WebHostOptions } from '@/hosting/WebHostOptions';
import { injectable } from 'inversify';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironment.cs,0e08dcc04b780183,references
@injectable()
export class HostingEnvironment implements IWebHostEnvironment {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	webRootPath: string = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	webRootFileProvider: IFileProvider = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	contentRootPath: string = undefined!;
}

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironmentExtensions.cs,cfa8d9a4a73c54e3
export const initialize = (
	hostingEnvironment: IWebHostEnvironment,
	contentRootPath: string,
	options: WebHostOptions,
): void => {
	// TODO

	// TODO: hostingEnvironment.applicationName =
	hostingEnvironment.contentRootPath = contentRootPath;
	// TODO: hostingEnvironment.contentRootFileProvider =

	const webRoot = options.webRoot;
	if (webRoot === undefined) {
		const wwwroot = resolve(hostingEnvironment.contentRootPath, 'wwwroot');
		if (existsSync(wwwroot)) {
			hostingEnvironment.webRootPath = wwwroot;
		}
	} else {
		hostingEnvironment.webRootPath = resolve(
			hostingEnvironment.contentRootPath,
			webRoot,
		);
	}

	if (hostingEnvironment.webRootPath) {
		// TODO: hostingEnvironment.webRootPath = getFullPath(hostingEnvironment.webRootPath);
		/* TODO: if (!Directory.exists(hostingEnvironment.webRootPath)) {
			Directory.createDirectory(hostingEnvironment.webRootPath);
		}*/
		hostingEnvironment.webRootFileProvider = new PhysicalFileProvider(
			hostingEnvironment.webRootPath,
		);
	} else {
		hostingEnvironment.webRootFileProvider = new NullFileProvider();
	}

	// TODO
};
