import { Ctor, IServiceProvider, getOrAdd } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';

import { INotification } from '../mediatr.contracts/INotification';
import { IRequest } from '../mediatr.contracts/IRequest';
import { IMediator } from './IMediator';
import { INotificationPublisher } from './INotificationPublisher';
import { NotificationHandlerExecutor } from './NotificationHandlerExecutor';
import {
	NotificationHandlerWrapper,
	NotificationHandlerWrapperImpl,
} from './wrappers/NotificationHandlerWrapper';

// https://github.com/jbogard/MediatR/blob/f4de8196adafd37faff274ce819ada93a3d7531b/src/MediatR/Mediator.cs#L16
export class Mediator implements IMediator {
	private readonly notificationHandlers = new Map<
		Ctor<INotification>,
		NotificationHandlerWrapper
	>();

	constructor(
		@inject(IServiceProvider)
		private readonly serviceProvider: IServiceProvider,
		@inject(INotificationPublisher)
		private readonly publisher: INotificationPublisher,
	) {}

	send<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
		throw new Error('Method not implemented.');
	}

	/**
	 * Override in a derived class to control how the tasks are awaited. By default the implementation calls the {@link INotificationPublisher}.
	 * @param handlerExecutors Enumerable of tasks representing invoking each notification handler
	 * @param notification The notification being published
	 * @returns A task representing invoking all handlers
	 */
	protected publishCore(
		handlerExecutors: NotificationHandlerExecutor[],
		notification: INotification,
	): Promise<void> {
		return this.publisher.publish(handlerExecutors, notification);
	}

	private publishNotification(notification: INotification): Promise<void> {
		const handler = getOrAdd(
			this.notificationHandlers,
			notification.constructor as Ctor<INotification>,
			(notificationCtor) => {
				const wrapper = new NotificationHandlerWrapperImpl(
					notificationCtor,
				);
				return wrapper;
			},
		);

		return handler.handle(
			notification,
			this.serviceProvider,
			(executors, notification) =>
				this.publishCore(executors, notification),
		);
	}

	publish<TNotification extends INotification>(
		notification: TNotification,
	): Promise<void> {
		return this.publishNotification(notification);
	}
}
