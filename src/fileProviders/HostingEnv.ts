import { IFileProvider } from '@/fileProviders/IFileProvider';
import { NullFileProvider } from '@/fileProviders/NullFileProvider';
import { PhysicalFileProvider } from '@/fileProviders/PhysicalFileProvider';
import { IWebHostEnv } from '@/hosting/IWebHostEnv';
import { WebHostOptions } from '@/hosting/WebHostOptions';
import { injectable } from 'inversify';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironment.cs,0e08dcc04b780183,references
@injectable()
export class HostingEnv implements IWebHostEnv {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	webRootPath: string = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	webRootFileProvider: IFileProvider = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	contentRootPath: string = undefined!;
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
