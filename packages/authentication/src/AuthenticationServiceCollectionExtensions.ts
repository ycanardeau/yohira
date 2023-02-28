import { AuthenticationOptions } from '@yohira/authentication.abstractions';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { AuthenticationBuilder } from './AuthenticationBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationServiceCollectionExtensions.cs,1a928b3d21b115bc,references
export function addAuthentication(
	services: IServiceCollection,
): AuthenticationBuilder {
	/* TODO: addAuthenticationCore(services);
	addDataProtection(services);
	addWebEncoders(services);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			ISystemClock,
			SystemClock,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IAuthenticationConfigProvider,
			DefaultAuthenticationConfigProvider,
		),
	); */

	return new AuthenticationBuilder(services);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationServiceCollectionExtensions.cs,b64bc68e19471282,references
export function addAuthenticationWithConfigureOptions(
	services: IServiceCollection,
	configureOptions: (options: AuthenticationOptions) => void,
): AuthenticationBuilder {
	const builder = addAuthentication(services);
	configureOptionsServices(AuthenticationOptions, services, configureOptions);
	return builder;
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationServiceCollectionExtensions.cs,ddb4a96243d634ab,references
export function addAuthenticationWithDefaultScheme(
	services: IServiceCollection,
	defaultScheme: string,
): AuthenticationBuilder {
	return addAuthenticationWithConfigureOptions(services, (o) => {
		o.defaultScheme = defaultScheme;
	});
}
