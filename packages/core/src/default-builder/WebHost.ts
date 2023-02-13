import { addTransientCtor } from '@yohira/extensions.dependency-injection.abstractions';
import { IStartupFilter, IWebHostBuilder } from '@yohira/hosting.abstractions';
import { useNode } from '@yohira/server.node';

import { HostFilteringStartupFilter } from './HostFilteringStartupFilter';

// https://source.dot.net/#Microsoft.AspNetCore/WebHost.cs,ca2002fa0bfdb774,references
export function configureWebDefaults(builder: IWebHostBuilder): void {
	// TODO
	useNode(builder, (builderContext, options) => {
		// TODO
	}).configureServices((hostingContext, services) => {
		// TODO

		addTransientCtor(services, IStartupFilter, HostFilteringStartupFilter);
		// TODO

		// TODO
	});
}
