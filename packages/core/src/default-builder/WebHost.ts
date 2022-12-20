import { HostFilteringStartupFilter } from '@yohira/core/default-builder/HostFilteringStartupFilter';
import { IStartupFilter } from '@yohira/hosting.abstractions/IStartupFilter';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';

// https://source.dot.net/#Microsoft.AspNetCore/WebHost.cs,ca2002fa0bfdb774,references
export const configureWebDefaults = (builder: IWebHostBuilder): void => {
	// TODO
	builder.configureServices(() => {
		// TODO

		// TODO: Use IServiceCollection.
		container
			.bind(IStartupFilter)
			.to(HostFilteringStartupFilter)
			.inTransientScope();

		// TODO
	});
};
