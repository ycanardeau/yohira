import { ConfigManager } from '@yohira/extensions.config';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostApplicationBuilderSettings.cs,d60b5dc13d25629c,references
export class HostAppBuilderSettings {
	disableDefaults = false;
	args?: string[];
	config?: ConfigManager;
	envName?: string;
	appName?: string;
	contentRootPath?: string;
}
