import { Ctor } from '@yohira/base';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions';

import { INotificationPublisher } from '../INotificationPublisher';
import { Mediator } from '../Mediatr';
import { ForOfAwaitPublisher } from '../notification-publishers/ForOfAwaitPublisher';

// https://github.com/jbogard/MediatR/blob/f4de8196adafd37faff274ce819ada93a3d7531b/src/MediatR/MicrosoftExtensionsDI/MediatrServiceConfiguration.cs#L9
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
}
