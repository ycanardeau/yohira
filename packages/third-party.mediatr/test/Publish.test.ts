import { StringBuilder, StringWriter, TextWriter } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	addTransientCtor,
	addTransientInstance,
	getRequiredService,
	inject,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	IMediator,
	INotification,
	INotificationHandler,
	addMediatR,
} from '@yohira/third-party.mediatr';
import { expect, test } from 'vitest';

class Ping implements INotification {
	message: string | undefined;
}

class PongHandler implements INotificationHandler<Ping> {
	constructor(
		@inject(Symbol.for('TextWriter')) private readonly writer: TextWriter,
	) {}

	handle(notification: Ping): Promise<void> {
		this.writer.writeLine(notification.message + ' Pong');
		return Promise.resolve();
	}
}

class PungHandler implements INotificationHandler<Ping> {
	constructor(
		@inject(Symbol.for('TextWriter')) private readonly writer: TextWriter,
	) {}

	handle(notification: Ping): Promise<void> {
		this.writer.writeLine(notification.message + ' Pung');
		return Promise.resolve();
	}
}

// https://github.com/jbogard/MediatR/blob/395ef0f400bcb92f2d9f9d1371bc33ae68419ae6/test/MediatR.Tests/PublishTests.cs#L52
test('Should_resolve_main_handler', async () => {
	const builder = new StringBuilder();
	const writer = new StringWriter(builder);

	const services = new ServiceCollection();
	addTransientCtor(
		services,
		Symbol.for('INotificationHandler<Ping>'),
		PongHandler,
	);
	addTransientCtor(
		services,
		Symbol.for('INotificationHandler<Ping>'),
		PungHandler,
	);
	addTransientInstance(services, Symbol.for('TextWriter'), writer);
	addMediatR(services, () => {});
	const serviceProvider = buildServiceProvider(services);

	const mediator = getRequiredService<IMediator>(serviceProvider, IMediator);

	await mediator.publish(
		((): Ping => {
			const ping = new Ping();
			ping.message = 'Ping';
			return ping;
		})(),
	);

	const result = builder.toString().split('\n');
	expect(result).toContain('Ping Pong');
	expect(result).toContain('Ping Pung');
});

// https://github.com/jbogard/MediatR/blob/395ef0f400bcb92f2d9f9d1371bc33ae68419ae6/test/MediatR.Tests/PublishTests.cs#L80C23-L80C72
test('Should_resolve_main_handler_when_object_is_passed', async () => {
	const builder = new StringBuilder();
	const writer = new StringWriter(builder);

	const services = new ServiceCollection();
	addTransientCtor(
		services,
		Symbol.for('INotificationHandler<Ping>'),
		PongHandler,
	);
	addTransientCtor(
		services,
		Symbol.for('INotificationHandler<Ping>'),
		PungHandler,
	);
	addTransientInstance(services, Symbol.for('TextWriter'), writer);
	addMediatR(services, () => {});
	const serviceProvider = buildServiceProvider(services);

	const mediator = getRequiredService<IMediator>(serviceProvider, IMediator);

	const message = ((): Ping => {
		const ping = new Ping();
		ping.message = 'Ping';
		return ping;
	})();
	await mediator.publish(message);

	const result = builder.toString().split('\n');
	expect(result).toContain('Ping Pong');
	expect(result).toContain('Ping Pung');
});

// TODO
