import {
	IServiceCollection,
	addSingletonCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { HstsMiddleware } from './HstsMiddleware';
import { HstsOptions } from './HstsOptions';

// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HstsServicesExtensions.cs,8917ae32b3e01398,references
export function addHsts(
	services: IServiceCollection,
	configureOptions: (options: HstsOptions) => void,
): IServiceCollection {
	configureOptionsServices(HstsOptions, services, configureOptions);

	// HACK
	addSingletonCtor(
		/* REVIEW */ services,
		Symbol.for('HstsMiddleware'),
		HstsMiddleware,
	);
	return services;
}
