import { INotification } from '../mediatr.contracts/INotification';

// https://github.com/jbogard/MediatR/blob/838a8e12b62ee95f2f1caa503d282a8d9bce6047/src/MediatR/NotificationHandlerExecutor.cs#L7
export class NotificationHandlerExecutor {
	constructor(
		readonly handlerInstance: object,
		readonly handlerCallback: (
			notification: INotification,
		) => Promise<void>,
	) {}
}
