import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

import { addRequiredServices } from '../registrar/ServiceRegistrar';
import { MediatRServiceConfig } from './MediatRServiceConfig';

function addMediatRCore(
	services: IServiceCollection,
	config: MediatRServiceConfig,
): IServiceCollection {
	// TODO: addMediatRClasses(services, config);

	addRequiredServices(services, config);

	return services;
}

// https://github.com/jbogard/MediatR/blob/f28cdc331faea401479d8e765b6f4dd536b2b085/src/MediatR/MicrosoftExtensionsDI/ServiceCollectionExtensions.cs#L26
export function addMediatR(
	services: IServiceCollection,
	config: (serviceConfig: MediatRServiceConfig) => void,
): IServiceCollection {
	const serviceConfig = new MediatRServiceConfig();

	config(serviceConfig);

	return addMediatRCore(services, serviceConfig);
}
