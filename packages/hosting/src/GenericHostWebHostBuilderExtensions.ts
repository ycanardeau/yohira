import {
	IHostBuilder,
	addHostedService,
} from '@yohira/extensions.hosting.abstractions';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';

import { WebHostBuilderOptions } from './WebHostBuilderOptions';
import { GenericWebHostBuilder } from './generic-host/GenericWebHostBuilder';
import { GenericWebHostService } from './generic-host/GenericWebHostService';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHostWebHostBuilderExtensions.cs,f00a712c64f2d28e,references
export function configureWebHost(
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	configureWebHostBuilder: (
		options: WebHostBuilderOptions,
	) => void = (): void => {},
): IHostBuilder {
	// TODO

	const webHostBuilderOptions = new WebHostBuilderOptions();
	configureWebHostBuilder(webHostBuilderOptions);
	const webHostBuilder = new GenericWebHostBuilder(
		builder,
		webHostBuilderOptions,
	);
	configure(webHostBuilder);
	builder.configureServices((context, services) =>
		addHostedService(GenericWebHostService, services),
	);
	return builder;
}
