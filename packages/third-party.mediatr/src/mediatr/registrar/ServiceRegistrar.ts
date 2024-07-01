import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';

import { IMediator } from '../IMediator';
import { INotificationPublisher } from '../INotificationPublisher';
import { MediatRServiceConfig } from '../extensions-di/MediatRServiceConfig';

// https://github.com/jbogard/MediatR/blob/43fb46f39020ab4880fefe75fa2315351f347742/src/MediatR/Registration/ServiceRegistrar.cs#L300
export function addRequiredServices(
	services: IServiceCollection,
	serviceConfig: MediatRServiceConfig,
): void {
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			serviceConfig.lifetime,
			IMediator,
			serviceConfig.mediatorImplCtor,
		),
	);
	// TODO

	const notificationPublisherServiceDescriptor =
		serviceConfig.notificationPublisherCtor !== undefined
			? ServiceDescriptor.fromCtor(
					serviceConfig.lifetime,
					INotificationPublisher,
					serviceConfig.notificationPublisherCtor,
				)
			: ServiceDescriptor.fromInstance(
					ServiceLifetime.Singleton,
					INotificationPublisher,
					serviceConfig.notificationPublisher,
				);

	tryAddServiceDescriptor(services, notificationPublisherServiceDescriptor);
}
