import { Type } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonCtor,
	tryAdd,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { EndpointRoutingMiddleware } from '../EndpointRoutingMiddleware';
import { RouteOptions } from '../RouteOptions';
import { RoutingMarkerService } from '../RoutingMarkerService';
import { DefaultEndpointSelector } from '../matching/DefaultEndpointSelector';
import { DfaMatcherBuilder } from '../matching/DfaMatcherBuilder';
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

	// TODO
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			Type.from('DfaMatcherBuilder'),
			DfaMatcherBuilder,
		),
	);
	// TODO

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

	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('EndpointSelector'),
			DefaultEndpointSelector,
		),
	);

	// TODO

	// HACK
	addSingletonCtor(
		/* REVIEW */ services,
		Type.from('EndpointRoutingMiddleware'),
		EndpointRoutingMiddleware,
	);

	return services;
}
