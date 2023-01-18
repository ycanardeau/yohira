import { Type } from '@yohira/base';
import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { EndpointRoutingMiddleware } from './EndpointRoutingMiddleware';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRoutingApplicationBuilderExtensions.cs,6fdcda103963a43b,references
function verifyRoutingServicesAreRegistered(app: IAppBuilder): void {
	if (
		app.appServices.getService(Type.from('RoutingMarkerService')) ===
		undefined
	) {
		throw new Error(
			`Unable to find the required services. Please add all the required services by calling 'IServiceCollection.addRouting' inside the call to 'ConfigureServices(...)' in the application startup code.` /* LOC */,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRoutingApplicationBuilderExtensions.cs,1a2bc82645b48b1c,references
export function useRouting(builder: IAppBuilder): IAppBuilder {
	verifyRoutingServicesAreRegistered(builder);

	// TODO

	return useMiddleware(EndpointRoutingMiddleware, builder /* TODO */);
}
