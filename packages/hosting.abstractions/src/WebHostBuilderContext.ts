import { IConfig } from '@yohira/extensions.config.abstractions';

import { IWebHostEnv } from './IWebHostEnv';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/WebHostBuilderContext.cs,0668c64ef2124ad1,references
/**
 * Context containing the common services on the {@link IWebHost}. Some properties may be null until set by the {@link IWebHost}.
 */
export class WebHostBuilderContext {
	/**
	 * The {@link IWebHostEnv} initialized by the {@link IWebHost}.
	 */
	hostingEnv!: IWebHostEnv;
	/**
	 * The {@link IConfig} containing the merged configuration of the application and the {@link IWebHost}.
	 */
	config!: IConfig;
}
