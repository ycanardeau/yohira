import { IConfigBuilder } from '@yohira/extensions.config.abstractions';
import { addEnvVariables } from '@yohira/extensions.config.env-variables';
import { addJsonFile } from '@yohira/extensions.config.json';
import { ServiceProviderOptions } from '@yohira/extensions.dependency-injection';
import {
	HostBuilderContext,
	IHostBuilder,
	isDevelopment,
} from '@yohira/extensions.hosting.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostingHostBuilderExtensions.cs,7a01d080950bf6c8,references
export function applyDefaultAppConfig(
	hostingContext: HostBuilderContext,
	appConfigBuilder: IConfigBuilder,
	args: string[] | undefined,
): void {
	const env = hostingContext.hostingEnv;
	const reloadOnChange = false; /* TODO */

	addJsonFile(
		appConfigBuilder,
		undefined,
		'appsettings.json',
		true,
		reloadOnChange,
	);
	addJsonFile(
		appConfigBuilder,
		undefined,
		`appsettings.${env.envName}.json`,
		true,
		reloadOnChange,
	);

	if (
		isDevelopment(env) &&
		env.appName !== undefined &&
		env.appName.length > 0
	) {
		// TODO
	}

	addEnvVariables(appConfigBuilder);

	if (args !== undefined && args.length > 0) {
		// TODO: addCommandLine(appConfigBuilder, args);
	}
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostingHostBuilderExtensions.cs,5d86d5acb42aaed3,references
export function configureDefaults(
	builder: IHostBuilder,
	args: string[] | undefined,
): IHostBuilder {
	/* TODO: configureHostConfig(builder, (config) =>
		applyDefaultHostConfig(config, args),
	);
	configureAppConfig(builder, (hostingContext, config) =>
		applyDefaultAppConfig(hostingContext, config, args),
	);
	builder.configureServices(addDefaultServices);
	useServiceProviderFactory(
		builder,
		(context) =>
			new DefaultServiceProviderFactory(
				createDefaultServiceProviderOptions(context),
			),
	); */
	return builder;
}

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
