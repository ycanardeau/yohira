import {
	IServiceCollection,
	addSingletonCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { HttpLoggingMiddleware } from './HttpLoggingMiddleware';
import { HttpLoggingOptions } from './HttpLoggingOptions';

// HACK
export function addHttpLogging(
	services: IServiceCollection,
	configureOptions?: (options: HttpLoggingOptions) => void,
): IServiceCollection {
	if (configureOptions !== undefined) {
		configureOptionsServices(
			HttpLoggingOptions,
			services,
			configureOptions,
		);
	}

	// HACK
	addSingletonCtor(
		/* REVIEW */ services,
		Symbol.for('HttpLoggingMiddleware'),
		HttpLoggingMiddleware,
	);
	return services;
}
