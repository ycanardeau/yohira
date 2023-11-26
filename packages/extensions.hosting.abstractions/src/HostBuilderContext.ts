import { IConfig } from '@yohira/extensions.config.abstractions';

import { IHostEnv } from './IHostEnv';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostBuilderContext.cs,c05e9bb195a831c5,references
/**
 * Context containing the common services on the {@link IHost}. Some properties may be null until set by the {@link IHost}.
 */
export class HostBuilderContext {
	/**
	 * The {@link IHostEnv} initialized by the {@link IHost}.
	 */
	hostingEnv!: IHostEnv;
	/**
	 * The {@link IConfig} containing the merged configuration of the application and the {@link IHost}.
	 */
	config!: IConfig;

	constructor(
		/**
		 * A central location for sharing state between components during the host building process.
		 */
		readonly properties: Map<keyof any, object /* TODO */>,
	) {}
}
