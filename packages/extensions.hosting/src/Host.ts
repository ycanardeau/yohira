import { IHostBuilder } from '@yohira/extensions.hosting.abstractions';

import { HostBuilder } from './HostBuilder';
import { configureDefaults } from './HostingHostBuilderExtensions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Host.cs,57374a8a9c12f043,references
export function createDefaultBuilder(args?: string[]): IHostBuilder {
	const builder = new HostBuilder();
	return configureDefaults(builder, args);
}
