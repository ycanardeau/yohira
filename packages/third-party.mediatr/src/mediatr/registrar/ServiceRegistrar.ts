import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';

import { IMediator } from '../IMediator';
import { INotificationPublisher } from '../INotificationPublisher';
import { MediatRServiceConfig } from '../extensions-di/MediatRServiceConfig';
import { RequestPostProcessorBehavior } from '../pipeline/RequestPostProcessorBehavior';
import { RequestPreProcessorBehavior } from '../pipeline/RequestPreProcessorBehavior';

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

	// TODO

	if (serviceConfig.requestPreProcessorsToRegister.length > 0) {
		tryAddServiceDescriptorIterable(
			services,
			ServiceDescriptor.fromCtor(
				ServiceLifetime.Transient,
				Symbol.for('IPipelineBehavior<>'),
				RequestPreProcessorBehavior,
			),
		);
		tryAddServiceDescriptorIterable(
			services,
			serviceConfig.requestPreProcessorsToRegister,
		);
	}

	if (serviceConfig.requestPostProcessorsToRegister.length > 0) {
		tryAddServiceDescriptorIterable(
			services,
			ServiceDescriptor.fromCtor(
				ServiceLifetime.Transient,
				Symbol.for('IPipelineBehavior<>'),
				RequestPostProcessorBehavior,
			),
		);
		tryAddServiceDescriptorIterable(
			services,
			serviceConfig.requestPostProcessorsToRegister,
		);
	}

	// TODO
}
