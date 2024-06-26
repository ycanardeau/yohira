import { combinePaths } from '@yohira/base';
import {
	NullFileProvider,
	PhysicalFileProvider,
} from '@yohira/extensions.file-providers';
import { IHostEnv } from '@yohira/extensions.hosting.abstractions';
import { IWebHostEnv } from '@yohira/hosting.abstractions';
import { existsSync } from 'node:fs';

import { WebHostOptions } from './WebHostOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironmentExtensions.cs,cfa8d9a4a73c54e3
export function initialize(
	hostingEnv: IWebHostEnv,
	contentRootPath: string,
	options: WebHostOptions,
	baseEnv?: IHostEnv,
): void {
	// TODO

	// TODO: hostingEnv.appName =
	hostingEnv.contentRootPath = contentRootPath;
	// TODO: hostingEnv.contentRootFileProvider =

	const webRoot = options.webRoot;
	if (webRoot === undefined) {
		const wwwroot = combinePaths(hostingEnv.contentRootPath, 'wwwroot');
		if (existsSync(wwwroot)) {
			hostingEnv.webRootPath = wwwroot;
		}
	} else {
		hostingEnv.webRootPath = combinePaths(
			hostingEnv.contentRootPath,
			webRoot,
		);
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

	hostingEnv.envName = baseEnv?.envName ?? options.env ?? hostingEnv.envName;
}
