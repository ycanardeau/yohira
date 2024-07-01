import { INotification } from '../mediatr.contracts/INotification';

// https://github.com/jbogard/MediatR/blob/c4f1a918b4cb90030f2df0878f5930b9ed7baf16/src/MediatR/IPublisher.cs#L9
export interface IPublisher {
	publish<TNotification extends INotification>(
		notification: TNotification,
	): Promise<void>;
}
