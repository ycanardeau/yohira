import { configureWebDefaults } from '@yohira/core/default-builder/WebHost';
import { IHostBuilder } from '@yohira/extensions.hosting.abstractions/IHostBuilder';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { configureWebHost } from '@yohira/hosting/GenericHostWebHostBuilderExtensions';

// https://source.dot.net/#Microsoft.AspNetCore/GenericHostBuilderExtensions.cs,1f4983d882f1bdcb,references
export function configureWebHostDefaults(
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	// TODO: configureOptions
): IHostBuilder {
	return configureWebHost(
		builder,
		(webHostBuilder) => {
			configureWebDefaults(webHostBuilder);

			configure(webHostBuilder);
		} /* TODO: configureOptions */,
	);
}
