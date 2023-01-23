import { Type, tryGetValue } from '@yohira/base';
import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { DefaultEndpointRouteBuilder } from './DefaultEndpointRouteBuilder';
import { EndpointMiddleware } from './EndpointMiddleware';
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
		endpointRouteBuilder = new DefaultEndpointRouteBuilder(builder);
		builder.properties.set(endpointRouteBuilderKey, endpointRouteBuilder);
	}

	// TODO

	// HACK
	endpointRouteBuilderRef.set(endpointRouteBuilder);

	return useMiddleware(EndpointRoutingMiddleware, builder /* TODO */);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRoutingApplicationBuilderExtensions.cs,1454cfee9683bfaf,references
function verifyEndpointRoutingMiddlewareIsRegistered(
	app: IAppBuilder,
): IEndpointRouteBuilder {
	const tryGetValueResult = tryGetValue(
		app.properties,
		endpointRouteBuilderKey,
	);
	if (!tryGetValueResult.ok) {
		const message =
			'EndpointRoutingMiddleware matches endpoints setup by EndpointMiddleware and so must be added to the request ' +
			'execution pipeline before EndpointMiddleware. ' +
			"Please add EndpointRoutingMiddleware  by calling 'IAppBuilder.useRouting' inside the call " +
			"to 'Configure(...)' in the application startup code.";
		throw new Error(message);
	}

	const endpointRouteBuilder = tryGetValueResult.val as IEndpointRouteBuilder;

	if (
		endpointRouteBuilder instanceof DefaultEndpointRouteBuilder &&
		app !== endpointRouteBuilder.appBuilder
	) {
		const message =
			'The EndpointRoutingMiddleware and EndpointMiddleware must be added to the same IAppBuilder instance. ' +
			"To use Endpoint Routing with 'map(...)', make sure to call 'IAppBuilder.useRouting' before " +
			"'IAppBuilder.useEndpoints' for each branch of the middleware pipeline.";
		throw new Error(message);
	}

	return endpointRouteBuilder;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRoutingApplicationBuilderExtensions.cs,48b62df97ef135a6,references
export function useEndpoints(
	builder: IAppBuilder,
	configure: (endpointRouteBuilder: IEndpointRouteBuilder) => void,
): IAppBuilder {
	verifyRoutingServicesAreRegistered(builder);

	const endpointRouteBuilder =
		verifyEndpointRoutingMiddlewareIsRegistered(builder);

	configure(endpointRouteBuilder);

	// TODO

	return useMiddleware(EndpointMiddleware, builder);
}
