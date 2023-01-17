import { Type } from '@yohira/base';
import {
	IServiceCollection,
	addSingletonCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { StaticFileMiddleware } from './StaticFileMiddleware';
import { StaticFileOptions } from './StaticFileOptions';

export function addStaticFiles(
	services: IServiceCollection,
	configureOptions?: (options: StaticFileOptions) => void,
): IServiceCollection {
	if (configureOptions !== undefined) {
		configureOptionsServices(services, StaticFileOptions, configureOptions);
	}
	addSingletonCtor(
		services,
		Type.from('StaticFileMiddleware'),
		StaticFileMiddleware,
	);
	return services;
}
