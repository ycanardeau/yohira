import { INotification } from '../mediatr.contracts/INotification';
import { NotificationHandlerExecutor } from './NotificationHandlerExecutor';

export const INotificationPublisher = Symbol.for('INotificationPublisher');
// https://github.com/jbogard/MediatR/blob/838a8e12b62ee95f2f1caa503d282a8d9bce6047/src/MediatR/INotificationPublisher.cs#L7
export interface INotificationPublisher {
	publish(
		handlerExecutors: NotificationHandlerExecutor[],
		notification: INotification,
	): Promise<void>;
}
