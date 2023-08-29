import {
	AuthenticationOptions,
	IAuthenticationConfigProvider,
} from '@yohira/authentication.abstractions';
import { addAuthenticationCore } from '@yohira/authentication.core';
import { systemTimeProvider } from '@yohira/base';
import { addDataProtection } from '@yohira/data-protection';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';
import { addWebEncoders } from '@yohira/extensions.web-encoders';

import { AuthenticationBuilder } from './AuthenticationBuilder';
import { DefaultAuthenticationConfigProvider } from './DefaultAuthenticationConfigProvider';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationServiceCollectionExtensions.cs,1a928b3d21b115bc,references
function addAuthenticationBase(
	services: IServiceCollection,
): AuthenticationBuilder {
	addAuthenticationCore(services);
	addDataProtection(services);
	addWebEncoders(services);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromInstance(
			ServiceLifetime.Singleton,
			Symbol.for('TimeProvider'),
			systemTimeProvider,
		),
	);
	/*tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			ISystemClock,
			SystemClock,
		),
	);*/
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IAuthenticationConfigProvider,
			DefaultAuthenticationConfigProvider,
		),
	);

	return new AuthenticationBuilder(services);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationServiceCollectionExtensions.cs,ddb4a96243d634ab,references
function addAuthenticationWithConfigureOptions(
	services: IServiceCollection,
	configureOptions: (options: AuthenticationOptions) => void,
): AuthenticationBuilder {
	const builder = addAuthenticationBase(services);
	configureOptionsServices(AuthenticationOptions, services, configureOptions);
	return builder;
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationServiceCollectionExtensions.cs,b64bc68e19471282,references
function addAuthenticationWithDefaultScheme(
	services: IServiceCollection,
	defaultScheme: string,
): AuthenticationBuilder {
	return addAuthenticationWithConfigureOptions(
		services,
		(o) => (o.defaultScheme = defaultScheme),
	);
}

export function addAuthentication(
	services: IServiceCollection,
): AuthenticationBuilder;
export function addAuthentication(
	services: IServiceCollection,
	configureOptions: (options: AuthenticationOptions) => void,
): AuthenticationBuilder;
export function addAuthentication(
	services: IServiceCollection,
	defaultScheme: string,
): AuthenticationBuilder;
export function addAuthentication(
	services: IServiceCollection,
	configureOptionsOrDefaultScheme?:
		| ((options: AuthenticationOptions) => void)
		| string,
): AuthenticationBuilder {
	if (configureOptionsOrDefaultScheme === undefined) {
		return addAuthenticationBase(services);
	} else if (typeof configureOptionsOrDefaultScheme === 'function') {
		return addAuthenticationWithConfigureOptions(
			services,
			configureOptionsOrDefaultScheme,
		);
	} else {
		return addAuthenticationWithDefaultScheme(
			services,
			configureOptionsOrDefaultScheme,
		);
	}
}
