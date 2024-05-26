import { AuthenticationBuilder } from '@yohira/authentication';
import {
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';
import { addOptionsWithName } from '@yohira/extensions.options';

import { CookieAuthenticationDefaults } from './CookieAuthenticationDefaults';
import { CookieAuthenticationHandler } from './CookieAuthenticationHandler';
import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';
import { PostConfigureCookieAuthenticationOptions } from './PostConfigureCookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieExtensions.cs,71e486317ee59c4f,references
function addCookieWithAuthenticationSchemeAndDisplayNameAndConfigureOptions(
	builder: AuthenticationBuilder,
	authenticationScheme: string,
	displayName: string | undefined,
	configureOptions: (options: CookieAuthenticationOptions) => void,
): AuthenticationBuilder {
	tryAddServiceDescriptorIterable(
		builder.services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IPostConfigureOptions<CookieAuthenticationOptions>'),
			PostConfigureCookieAuthenticationOptions,
		),
	);
	addOptionsWithName<CookieAuthenticationOptions>(
		builder.services,
		authenticationScheme,
	).validate(
		CookieAuthenticationOptions,
		(o) => o.cookie.expiration === undefined,
		'cookie.expiration is ignored, use ExpireTimeSpan instead.',
	);
	return builder.addScheme<
		CookieAuthenticationOptions,
		CookieAuthenticationHandler
	>(
		CookieAuthenticationOptions,
		CookieAuthenticationHandler,
		authenticationScheme,
		displayName,
		configureOptions,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieExtensions.cs,6c8c789951d01911,references
function addCookieWithAuthenticationSchemeAndConfigureOptions(
	builder: AuthenticationBuilder,
	authenticationScheme: string,
	configureOptions: (options: CookieAuthenticationOptions) => void,
): AuthenticationBuilder {
	return addCookieWithAuthenticationSchemeAndDisplayNameAndConfigureOptions(
		builder,
		authenticationScheme,
		undefined!,
		configureOptions,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieExtensions.cs,5213268e7f12272d,references
function addCookieWithAuthenticationScheme(
	builder: AuthenticationBuilder,
	authenticationScheme: string,
): AuthenticationBuilder {
	return addCookieWithAuthenticationSchemeAndConfigureOptions(
		builder,
		authenticationScheme,
		undefined!,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieExtensions.cs,0b8b178019b6d4af,references
function addCookieWithConfigureOptions(
	builder: AuthenticationBuilder,
	configureOptions: (options: CookieAuthenticationOptions) => void,
): AuthenticationBuilder {
	return addCookieWithAuthenticationSchemeAndConfigureOptions(
		builder,
		CookieAuthenticationDefaults.authenticationScheme,
		configureOptions,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieExtensions.cs,af9790eb5f8abc9f,references
export function addCookie(
	builder: AuthenticationBuilder,
): AuthenticationBuilder;
export function addCookie(
	builder: AuthenticationBuilder,
	authenticationScheme: string,
	configureOptions: (options: CookieAuthenticationOptions) => void,
): AuthenticationBuilder;
export function addCookie(
	builder: AuthenticationBuilder,
	authenticationScheme?: string,
	configureOptions?: (options: CookieAuthenticationOptions) => void,
): AuthenticationBuilder {
	if (authenticationScheme === undefined) {
		if (configureOptions === undefined) {
			return addCookieWithAuthenticationScheme(
				builder,
				CookieAuthenticationDefaults.authenticationScheme,
			);
		} else {
			return addCookieWithConfigureOptions(builder, configureOptions);
		}
	} else {
		if (configureOptions === undefined) {
			return addCookieWithAuthenticationScheme(
				builder,
				authenticationScheme,
			);
		} else {
			return addCookieWithAuthenticationSchemeAndConfigureOptions(
				builder,
				authenticationScheme,
				configureOptions,
			);
		}
	}
}
