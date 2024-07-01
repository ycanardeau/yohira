import { INotification } from '../../mediatr.contracts/INotification';
import { INotificationPublisher } from '../INotificationPublisher';
import { NotificationHandlerExecutor } from '../NotificationHandlerExecutor';

// https://github.com/jbogard/MediatR/blob/40afa9fc6ec7ddcfc8fac2584861916fb571f817/src/MediatR/NotificationPublishers/TaskWhenAllPublisher.cs#L20
export class PromiseAllPublisher implements INotificationPublisher {
	async publish(
		handlerExecutors: NotificationHandlerExecutor[],
		notification: INotification,
	): Promise<void> {
		const tasks = handlerExecutors.map((handler) =>
			handler.handlerCallback(notification),
		);

		await Promise.all(tasks);
	}
}
