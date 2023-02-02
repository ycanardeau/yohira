import { ServiceProviderOptions } from '@yohira/extensions.dependency-injection';
import {
	HostBuilderContext,
	isDevelopment,
} from '@yohira/extensions.hosting.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostingHostBuilderExtensions.cs,edb073ce2583a197,references
export function createDefaultServiceProviderOptions(
	context: HostBuilderContext,
): ServiceProviderOptions {
	const development = isDevelopment(context.hostingEnv);
	const options = new ServiceProviderOptions();
	options.validateScopes = development;
	options.validateOnBuild = development;
	return options;
}
