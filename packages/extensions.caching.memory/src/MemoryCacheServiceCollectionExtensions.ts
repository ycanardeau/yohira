import { IDistributedCache } from '@yohira/extensions.caching.abstractions';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { addOptions } from '@yohira/extensions.options';

import { MemoryDistributedCache } from './MemoryDistributedCache';

export function addDistributedMemoryCache(
	services: IServiceCollection,
): IServiceCollection {
	addOptions(services);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			IDistributedCache,
			MemoryDistributedCache,
		),
	);

	return services;
}
