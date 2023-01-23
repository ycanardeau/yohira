import { Type, tryGetValue } from '@yohira/base';
import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { DefaultEndpointRouteBuilder } from './DefaultEndpointRouteBuilder';
import {
	EndpointRoutingMiddleware,
	endpointRouteBuilderRef,
} from './EndpointRoutingMiddleware';
import { IEndpointRouteBuilder } from './IEndpointRouteBuilder';

const endpointRouteBuilderKey = '__EndpointRouteBuilder';
const globalEndpointRouteBuilderKey = '__GlobalEndpointRouteBuilder';

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

	let endpointRouteBuilder: IEndpointRouteBuilder;
	const tryGetValueResult = tryGetValue(
		builder.properties,
		globalEndpointRouteBuilderKey,
	);
	if (tryGetValueResult.ok) {
		endpointRouteBuilder = tryGetValueResult.val as IEndpointRouteBuilder;
		// Let interested parties know if useRouting() was called while a global route builder was set
		builder.properties.set(endpointRouteBuilderKey, endpointRouteBuilder);
	} else {
		endpointRouteBuilder =
			new DefaultEndpointRouteBuilder(/* TODO: builder */);
		builder.properties.set(endpointRouteBuilderKey, endpointRouteBuilder);
	}

	// TODO

	// HACK
	endpointRouteBuilderRef.set(endpointRouteBuilder);

	return useMiddleware(EndpointRoutingMiddleware, builder /* TODO */);
}
