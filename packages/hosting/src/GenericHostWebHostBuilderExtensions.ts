import { IHostBuilder } from '@yohira/extensions.hosting.abstractions/IHostBuilder';
import { addHostedService } from '@yohira/extensions.hosting.abstractions/ServiceCollectionHostedServiceExtensions';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { GenericWebHostBuilder } from '@yohira/hosting/generic-host/GenericWebHostBuilder';
import { GenericWebHostService } from '@yohira/hosting/generic-host/GenericWebHostService';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHostWebHostBuilderExtensions.cs,f00a712c64f2d28e,references
export const configureWebHost = (
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	// TODO: configureWebHostBuilder
): IHostBuilder => {
	// TODO
	const webHostBuilder = new GenericWebHostBuilder(builder);
	configure(webHostBuilder);
	builder.configureServices((/* TODO */ services) =>
		addHostedService(services, GenericWebHostService),
	);
	return builder;
};
