import { INotification } from '../mediatr.contracts/INotification';

// https://github.com/jbogard/MediatR/blob/c4f1a918b4cb90030f2df0878f5930b9ed7baf16/src/MediatR/INotificationHandler.cs#L10
export interface INotificationHandler<TNotification extends INotification> {
	handle(notification: TNotification): Promise<void>;
}

// https://github.com/jbogard/MediatR/blob/c4f1a918b4cb90030f2df0878f5930b9ed7baf16/src/MediatR/INotificationHandler.cs#L25
export abstract class NotificationHandler<TNotification extends INotification>
	implements INotificationHandler<TNotification>
{
	protected abstract handleCore(notification: TNotification): void;

	handle(notification: TNotification): Promise<void> {
		this.handleCore(notification);

		return Promise.resolve();
	}
}
