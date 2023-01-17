import { Type } from '@yohira/base';
import {
	IServiceCollection,
	addSingletonCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { HttpLoggingMiddleware } from './HttpLoggingMiddleware';
import { HttpLoggingOptions } from './HttpLoggingOptions';

export function addHttpLogging(
	services: IServiceCollection,
	configureOptions?: (options: HttpLoggingOptions) => void,
): IServiceCollection {
	if (configureOptions !== undefined) {
		configureOptionsServices(
			services,
			HttpLoggingOptions,
			configureOptions,
		);
	}
	addSingletonCtor(
		services,
		Type.from('HttpLoggingMiddleware'),
		HttpLoggingMiddleware,
	);
	return services;
}
