import {
	IAuthenticationHandlerProvider,
	IAuthenticationSchemeProvider,
	IAuthenticationService,
	IClaimsTransformation,
} from '@yohira/authentication.abstractions';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';

import { AuthenticationHandlerProvider } from './AuthenticationHandlerProvider';
import { AuthenticationSchemeProvider } from './AuthenticationSchemeProvider';
import { AuthenticationService } from './AuthenticationService';
import { NoopClaimsTransformation } from './NoopClaimsTransformation';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/AuthenticationCoreServiceCollectionExtensions.cs,c2aac84c86480932,references
/**
 * Add core authentication services needed for {@link IAuthenticationService}.
 * @param services The {@link IServiceCollection}.
 * @returns The service collection.
 */
export function addAuthenticationCore(
	services: IServiceCollection,
): IServiceCollection {
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Scoped,
			IAuthenticationService,
			AuthenticationService,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IClaimsTransformation,
			NoopClaimsTransformation,
		),
	); // Can be replaced with scoped ones that use DbContext
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Scoped,
			IAuthenticationHandlerProvider,
			AuthenticationHandlerProvider,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IAuthenticationSchemeProvider,
			AuthenticationSchemeProvider,
		),
	);
	return services;
}
