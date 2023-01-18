import { Type } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonCtor,
	tryAdd,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { DefaultEndpointRouteBuilder } from '../DefaultEndpointRouteBuilder';
import { EndpointRoutingMiddleware } from '../EndpointRoutingMiddleware';
import { RouteOptions } from '../RouteOptions';
import { RoutingMarkerService } from '../RoutingMarkerService';
import { DfaMatcherFactory } from '../matching/DfaMatcherFactory';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/DependencyInjection/RoutingServiceCollectionExtensions.cs,25e3665e57533cd3,references
export function addRouting(
	services: IServiceCollection,
	configureOptions?: (options: RouteOptions) => void,
): IServiceCollection {
	if (configureOptions !== undefined) {
		configureOptionsServices(RouteOptions, services, configureOptions);
	}

	// TODO

	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('RoutingMarkerService'),
			RoutingMarkerService,
		),
	);

	// TODO

	// HACK: https://github.com/dotnet/aspnetcore/blob/85e2147ff037cc9950249fbb9d095ad47ec4184a/src/Http/Routing/src/DependencyInjection/RoutingServiceCollectionExtensions.cs#L69
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			Type.from('IEndpointRouteBuilder'),
			DefaultEndpointRouteBuilder,
		),
	);

	// TODO
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('MatcherFactory'),
			DfaMatcherFactory,
		),
	);
	// TODO

	// TODO

	// HACK
	addSingletonCtor(
		/* REVIEW */ services,
		Type.from('EndpointRoutingMiddleware'),
		EndpointRoutingMiddleware,
	);

	return services;
}
