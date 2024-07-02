import { Ctor } from '@yohira/base';
import {
	ServiceDescriptor,
	ServiceLifetime,
} from '@yohira/extensions.dependency-injection.abstractions';

import { INotificationPublisher } from '../INotificationPublisher';
import { Mediator } from '../Mediatr';
import { ForOfAwaitPublisher } from '../notification-publishers/ForOfAwaitPublisher';

// https://github.com/jbogard/MediatR/blob/8b1ee39fe29fd12c8042d22f9fd1a969b5fcbc16/src/MediatR/MicrosoftExtensionsDI/MediatrServiceConfiguration.cs#L12
export class MediatRServiceConfig {
	/**
	 * Mediator implementation type to register. Default is {@link Mediator}
	 */
	mediatorImplCtor: Ctor<object> = Mediator;
	/**
	 * Strategy for publishing notifications. Defaults to {@link ForeachAwaitPublisher}
	 */
	notificationPublisher: INotificationPublisher = new ForOfAwaitPublisher();
	/**
	 * Type of notification publisher strategy to register. If set, overrides {@link NotificationPublisher}
	 */
	notificationPublisherCtor?: Ctor<object>;
	/**
	 * Service lifetime to register services under. Default value is {@link ServiceLifetime.Transient}
	 */
	lifetime: ServiceLifetime = ServiceLifetime.Transient;
	/**
	 * List of request pre processors to register in specific order
	 */
	requestPreProcessorsToRegister: ServiceDescriptor[] = [];
	/**
	 * List of request post processors to register in specific order
	 */
	requestPostProcessorsToRegister: ServiceDescriptor[] = [];
}
