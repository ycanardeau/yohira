import { Ctor, IServiceProvider } from '@yohira/base';
import { getServices } from '@yohira/extensions.dependency-injection.abstractions';

import { INotification } from '../../mediatr.contracts/INotification';
import { INotificationHandler } from '../INotificationHandler';
import { NotificationHandlerExecutor } from '../NotificationHandlerExecutor';

// https://github.com/jbogard/MediatR/blob/838a8e12b62ee95f2f1caa503d282a8d9bce6047/src/MediatR/Wrappers/NotificationHandlerWrapper.cs#L10
export abstract class NotificationHandlerWrapper {
	abstract handle(
		notification: INotification,
		serviceFactory: IServiceProvider,
		publish: (
			executors: NotificationHandlerExecutor[],
			notification: INotification,
		) => Promise<void>,
	): Promise<void>;
}

// https://github.com/jbogard/MediatR/blob/838a8e12b62ee95f2f1caa503d282a8d9bce6047/src/MediatR/Wrappers/NotificationHandlerWrapper.cs#L17
export class NotificationHandlerWrapperImpl<
	TNotification extends INotification,
> extends NotificationHandlerWrapper {
	constructor(private readonly notificationCtor: Ctor<TNotification>) {
		super();
	}

	handle(
		notification: INotification,
		serviceFactory: IServiceProvider,
		publish: (
			executors: NotificationHandlerExecutor[],
			notification: INotification,
		) => Promise<void>,
	): Promise<void> {
		const handlers = getServices<INotificationHandler<TNotification>>(
			serviceFactory,
			Symbol.for(`INotificationHandler<${this.notificationCtor.name}>`),
		).map(
			(x) =>
				new NotificationHandlerExecutor(x, (theNotification) =>
					x.handle(theNotification as TNotification),
				),
		);

		return publish(handlers, notification);
	}
}
