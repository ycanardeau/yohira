import { IHostBuilder } from '@yohira/extensions.hosting.abstractions';
import { WebHostBuilderOptions, configureWebHost } from '@yohira/hosting';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';

import { configureWebDefaults } from './WebHost';

// https://source.dot.net/#Microsoft.AspNetCore/GenericHostBuilderExtensions.cs,1f4983d882f1bdcb,references
export function configureWebHostDefaults(
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	configureOptions: (options: WebHostBuilderOptions) => void = (): void => {},
): IHostBuilder {
	return configureWebHost(
		builder,
		(webHostBuilder) => {
			configureWebDefaults(webHostBuilder);

			configure(webHostBuilder);
		},
		configureOptions,
	);
}
