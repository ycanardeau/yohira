import { configureWebDefaults } from '@/default-builder/WebHost';
import { IHostBuilder } from '@yohira/extensions.hosting.abstractions';
import { configureWebHost } from '@yohira/hosting';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';

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
