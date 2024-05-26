import {
	AuthenticationOptions,
	IAuthenticationHandler,
} from '@yohira/authentication.abstractions';
import { Ctor, TimeProvider } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addTransientCtor,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	addOptionsWithName,
	configureNamedOptionsServices,
	configureOptionsServices,
} from '@yohira/extensions.options';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';

// Set TimeProvider from DI on all options instances, if not already set by tests.
class PostConfigureAuthenticationSchemeOptions<
	TOptions extends AuthenticationSchemeOptions,
> {
	constructor(readonly timeProvider: TimeProvider) {}

	postConfigure(name: string | undefined, options: TOptions): void {
		options.timeProvider ??= this.timeProvider;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationBuilder.cs,ae8b6602eaed3fe4,references
/**
 * Used to configure authentication
 */
export class AuthenticationBuilder {
	constructor(readonly services: IServiceCollection) {}

	private addSchemeHelper<
		TOptions extends AuthenticationSchemeOptions,
		THandler extends IAuthenticationHandler,
	>(
		optionsCtor: Ctor<TOptions>,
		handlerCtor: Ctor<THandler>,
		authenticationScheme: string,
		displayName: string | undefined,
		configureOptions: ((options: TOptions) => void) | undefined,
	): AuthenticationBuilder {
		configureOptionsServices<AuthenticationOptions>(
			AuthenticationOptions,
			this.services,
			(o) => {
				o.addScheme(authenticationScheme, (scheme) => {
					scheme.handlerCtor = handlerCtor;
					scheme.displayName = displayName;
				});
			},
		);
		if (configureOptions !== undefined) {
			configureNamedOptionsServices<TOptions>(
				optionsCtor,
				this.services,
				authenticationScheme,
				configureOptions,
			);
		}
		addOptionsWithName<TOptions>(
			this.services,
			authenticationScheme,
		).validate(optionsCtor, (o) => {
			o.validate(authenticationScheme);
			return true;
		});
		addTransientCtor(
			this.services,
			Symbol.for(handlerCtor.name),
			handlerCtor,
		);
		tryAddServiceDescriptorIterable(
			this.services,
			ServiceDescriptor.fromCtor(
				ServiceLifetime.Singleton,
				Symbol.for(`IPostConfigureOptions<${optionsCtor.name}>`),
				PostConfigureAuthenticationSchemeOptions<TOptions>,
			),
		);
		return this;
	}

	addScheme<
		TOptions extends AuthenticationSchemeOptions,
		THandler extends IAuthenticationHandler,
	>(
		optionsCtor: Ctor<TOptions>,
		handlerCtor: Ctor<THandler>,
		authenticationScheme: string,
		displayName: string | undefined,
		configureOptions: ((options: TOptions) => void) | undefined,
	): AuthenticationBuilder {
		return this.addSchemeHelper<TOptions, THandler>(
			optionsCtor,
			handlerCtor,
			authenticationScheme,
			displayName,
			configureOptions,
		);
	}
}
