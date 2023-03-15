import { addDataProtection } from '@yohira/data-protection';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonCtor,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';

import { DistributedSessionStore } from './DistributedSessionStore';
import { ISessionStore } from './ISessionStore';
import { SessionMiddleware } from './SessionMiddleware';
import { SessionOptions } from './SessionOptions';

function addSessionCore(services: IServiceCollection): IServiceCollection {
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			ISessionStore,
			DistributedSessionStore,
		),
	);
	addDataProtection(services);

	// HACK
	addSingletonCtor(
		/* REVIEW */ services,
		Symbol.for('SessionMiddleware'),
		SessionMiddleware,
	);
	return services;
}

export function addSession(
	services: IServiceCollection,
	configure: (options: SessionOptions) => void,
): IServiceCollection {
	configureOptionsServices(SessionOptions, services, configure);
	addSessionCore(services);

	return services;
}
