import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonCtor,
	tryAddServiceDescriptor,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { EndpointMiddleware } from '../EndpointMiddleware';
import { EndpointRoutingMiddleware } from '../EndpointRoutingMiddleware';
import { RouteOptions } from '../RouteOptions';
import { RoutingMarkerService } from '../RoutingMarkerService';
import { DefaultEndpointSelector } from '../matching/DefaultEndpointSelector';
import { DfaMatcherBuilder } from '../matching/DfaMatcherBuilder';
import { DfaMatcherFactory } from '../matching/DfaMatcherFactory';
import { HttpMethodMatcherPolicy } from '../matching/HttpMethodMatcherPolicy';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/DependencyInjection/RoutingServiceCollectionExtensions.cs,25e3665e57533cd3,references
export function addRouting(
	services: IServiceCollection,
	configureOptions?: (options: RouteOptions) => void,
): IServiceCollection {
	if (configureOptions !== undefined) {
		configureOptionsServices(RouteOptions, services, configureOptions);
	}

	// TODO

	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('RoutingMarkerService'),
			RoutingMarkerService,
		),
	);

	// TODO

	// TODO
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			Symbol.for('DfaMatcherBuilder'),
			DfaMatcherBuilder,
		),
	);
	// TODO

	// TODO
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('MatcherFactory'),
			DfaMatcherFactory,
		),
	);
	// TODO

	// TODO

	//
	// Endpoint Selection
	//
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('EndpointSelector'),
			DefaultEndpointSelector,
		),
	);
	tryAddServiceDescriptorIterable(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('MatcherPolicy'),
			HttpMethodMatcherPolicy,
		),
	);
	// TODO

	// TODO

	// HACK
	addSingletonCtor(
		/* REVIEW */ services,
		Symbol.for('EndpointRoutingMiddleware'),
		EndpointRoutingMiddleware,
	);
	addSingletonCtor(
		/* REVIEW */ services,
		Symbol.for('EndpointMiddleware'),
		EndpointMiddleware,
	);

	return services;
}
