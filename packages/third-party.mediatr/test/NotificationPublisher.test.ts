import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	IMediator,
	INotification,
	PromiseAllPublisher,
	addMediatR,
} from '@yohira/third-party.mediatr';
import { expect, test } from 'vitest';

class Notification implements INotification {}

// https://github.com/jbogard/MediatR/blob/e1a6418eab81fd56f433d7b031a2467a10fefeee/test/MediatR.Tests/NotificationPublisherTests.cs#L34
test('Should_handle_sequentially_by_default', async () => {
	let services = new ServiceCollection();
	addMediatR(services, (cfg) => {});
	let serviceProvider = buildServiceProvider(services);

	let mediator = getRequiredService<IMediator>(serviceProvider, IMediator);

	let start = Date.now();

	await mediator.publish(new Notification());

	let end = Date.now();

	const sequentialElapsed = end - start;

	services = new ServiceCollection();
	addMediatR(services, (cfg) => {
		cfg.notificationPublisherCtor = PromiseAllPublisher;
	});
	serviceProvider = buildServiceProvider(services);

	mediator = getRequiredService<IMediator>(serviceProvider, IMediator);

	start = Date.now();

	await mediator.publish(new Notification());

	end = Date.now();

	const parallelElapsed = end - start;

	expect(sequentialElapsed).greaterThan(parallelElapsed);
});
