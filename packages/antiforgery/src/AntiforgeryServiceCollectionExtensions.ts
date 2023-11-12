import { addDataProtection } from '@yohira/data-protection';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { AntiforgeryOptions } from './AntiforgeryOptions';
import { IAntiforgery } from './IAntiforgery';
import { AntiforgeryOptionsSetup } from './internal/AntiforgeryOptionsSetup';
import { DefaultAntiforgery } from './internal/DefaultAntiforgery';
import { DefaultAntiforgeryTokenStore } from './internal/DefaultAntiforgeryTokenStore';
import { IAntiforgeryTokenStore } from './internal/IAntiforgeryTokenStore';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/AntiforgeryServiceCollectionExtensions.cs,5dede04cf233c9b3,references
export function addAntiforgery(
	services: IServiceCollection,
	setupAction?: (options: AntiforgeryOptions) => void,
): IServiceCollection {
	addDataProtection(services);

	// Don't overwrite any options setups that a user may have added.
	tryAddServiceDescriptorIterable(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			Symbol.for('IConfigureOptions<AntiforgeryOptions>'),
			AntiforgeryOptionsSetup,
		),
	);

	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IAntiforgery,
			DefaultAntiforgery,
		),
	);
	// TODO
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IAntiforgeryTokenStore,
			DefaultAntiforgeryTokenStore,
		),
	);
	// TODO

	if (setupAction !== undefined) {
		configureOptionsServices(AntiforgeryOptions, services, setupAction);
	}

	return services;
}
