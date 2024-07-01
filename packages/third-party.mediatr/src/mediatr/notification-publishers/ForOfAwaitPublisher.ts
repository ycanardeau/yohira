import { INotification } from '../../mediatr.contracts/INotification';
import { INotificationPublisher } from '../INotificationPublisher';
import { NotificationHandlerExecutor } from '../NotificationHandlerExecutor';

// https://github.com/jbogard/MediatR/blob/838a8e12b62ee95f2f1caa503d282a8d9bce6047/src/MediatR/NotificationPublishers/ForeachAwaitPublisher.cs#L17
export class ForOfAwaitPublisher implements INotificationPublisher {
	async publish(
		handlerExecutors: NotificationHandlerExecutor[],
		notification: INotification,
	): Promise<void> {
		for (const handler of handlerExecutors) {
			await handler.handlerCallback(notification);
		}
	}
}
