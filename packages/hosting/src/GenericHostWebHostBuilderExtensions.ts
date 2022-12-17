import { IHostBuilder } from '@yohira/hosting.abstractions/IHostBuilder';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { GenericWebHostBuilder } from '@yohira/hosting/generic-host/GenericWebHostBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHostWebHostBuilderExtensions.cs,f00a712c64f2d28e,references
export const configureWebHost = (
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	// TODO: configureWebHostBuilder
): IHostBuilder => {
	// TODO
	const webHostBuilder = new GenericWebHostBuilder(builder);
	configure(webHostBuilder);
	// TODO
	return builder;
};
