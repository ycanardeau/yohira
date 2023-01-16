import { GenericWebHostBuilder } from '@/generic-host/GenericWebHostBuilder';
import { GenericWebHostService } from '@/generic-host/GenericWebHostService';
import {
	IHostBuilder,
	addHostedService,
} from '@yohira/extensions.hosting.abstractions';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHostWebHostBuilderExtensions.cs,f00a712c64f2d28e,references
export function configureWebHost(
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	// TODO: configureWebHostBuilder
): IHostBuilder {
	// TODO
	const webHostBuilder = new GenericWebHostBuilder(builder);
	configure(webHostBuilder);
	builder.configureServices((/* TODO */ services) =>
		addHostedService(services, GenericWebHostService),
	);
	return builder;
}
