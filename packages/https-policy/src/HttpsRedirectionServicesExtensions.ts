import {
	IServiceCollection,
	addSingletonCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { HttpsRedirectionMiddleware } from './HttpsRedirectionMiddleware';
import { HttpsRedirectionOptions } from './HttpsRedirectionOptions';

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HttpsRedirectionServicesExtensions.cs,32c4478902cc1c38,references
/**
 * Adds HTTPS redirection services.
 * @param services The {@link IServiceCollection} for adding services.
 * @param configureOptions A delegate to configure the {@link HttpsRedirectionOptions}.
 * @returns
 */
export function addHttpsRedirection(
	services: IServiceCollection,
	configureOptions: (options: HttpsRedirectionOptions) => void,
): IServiceCollection {
	configureOptionsServices(
		HttpsRedirectionOptions,
		services,
		configureOptions,
	);

	// HACK
	addSingletonCtor(
		/* REVIEW */ services,
		Symbol.for('HttpsRedirectionMiddleware'),
		HttpsRedirectionMiddleware,
	);
	return services;
}
