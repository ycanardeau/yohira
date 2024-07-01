import { StringBuilder, StringWriter, TextWriter } from '@yohira/base';
import {
	INotification,
	NotificationHandler,
} from '@yohira/third-party.mediatr';
import { expect, test } from 'vitest';

class Ping implements INotification {
	message: string | undefined;
}

class PongChildHandler extends NotificationHandler<Ping> {
	constructor(private readonly writer: TextWriter) {
		super();
	}

	handleCore(notification: Ping): void {
		this.writer.writeString(notification.message + ' Pong');
	}
}

// https://github.com/jbogard/MediatR/blob/e22f2f68f29dc19111987068afbfc99836efb11a/test/MediatR.Tests/NotificationHandlerTests.cs#L32
test('Should_call_abstract_handle_method', async () => {
	const builder = new StringBuilder();
	const writer = new StringWriter(builder);

	const handler = new PongChildHandler(writer);

	await handler.handle(
		((): Ping => {
			const ping = new Ping();
			ping.message = 'Ping';
			return ping;
		})(),
	);

	const result = builder.toString();
	expect(result).toContain('Ping Pong');
});
