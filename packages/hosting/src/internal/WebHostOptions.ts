import { IConfig } from '@yohira/extensions.config.abstractions';
import { IHostEnv } from '@yohira/extensions.hosting.abstractions';
import { WebHostDefaults } from '@yohira/hosting.abstractions';

import { parseBoolean } from './WebHostUtilities';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/WebHostOptions.cs,902a20346ae6a661,references
export class WebHostOptions {
	readonly env: string | undefined;
	readonly webRoot: string | undefined;
	readonly serverUrls: string | undefined;
	readonly preferHostingUrls: boolean;

	constructor(
		primaryConfig: IConfig,
		fallbackConfig?: IConfig,
		env?: IHostEnv,
	) {
		function getConfig(key: string): string | undefined {
			return primaryConfig.get(key) ?? fallbackConfig?.get(key);
		}

		this.env = env?.envName ?? getConfig(WebHostDefaults.EnvKey);
		this.webRoot = getConfig(WebHostDefaults.WebRootKey);
		this.serverUrls = getConfig(WebHostDefaults.ServerUrlsKey);
		this.preferHostingUrls = parseBoolean(
			getConfig(WebHostDefaults.PreferHostingUrlsKey),
		);
	}
}
