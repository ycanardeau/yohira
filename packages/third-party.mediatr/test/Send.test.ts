import { IServiceProvider } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	addSingletonInstance,
	addTransientCtor,
	getRequiredService,
	inject,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	IMediator,
	IRequest,
	IRequestHandler,
	addMediatR,
} from '@yohira/third-party.mediatr';
import { beforeEach, expect, test } from 'vitest';

class Pong {
	message: string | undefined;
}

class Ping implements IRequest<Pong> {
	message: string | undefined;
}

class VoidPing implements IRequest<void> {}

class PingHandler implements IRequestHandler<Ping, Pong> {
	handle(request: Ping): Promise<Pong> {
		return Promise.resolve(
			((): Pong => {
				const pong = new Pong();
				pong.message = request.message + ' Pong';
				return pong;
			})(),
		);
	}
}

class Dependency {
	called = false;
}

class VoidPingHandler implements IRequestHandler<VoidPing, void> {
	constructor(
		@inject(Symbol.for('Dependency'))
		private readonly dependency: Dependency,
	) {}

	handle(): Promise<void> {
		this.dependency.called = true;

		return Promise.resolve();
	}
}

class GenericPing<T extends Pong> implements IRequest<T> {
	pong: T | undefined;
}

class GenericPingHandler<T extends Pong>
	implements IRequestHandler<GenericPing<T>, T>
{
	constructor(
		@inject(Symbol.for('Dependency'))
		private readonly dependency: Dependency,
	) {}

	handle(request: GenericPing<T>): Promise<T> {
		this.dependency.called = true;
		request.pong!.message += ' Pong';
		return Promise.resolve(request.pong!);
	}
}

class VoidGenericPing<T extends Pong> implements IRequest<void> {}

class VoidGenericPingHandler<T extends Pong>
	implements IRequestHandler<VoidGenericPing<T>, void>
{
	constructor(
		@inject(Symbol.for('Dependency'))
		private readonly dependency: Dependency,
	) {}

	handle(): Promise<void> {
		this.dependency.called = true;

		return Promise.resolve();
	}
}

let serviceProvider: IServiceProvider;
let dependency: Dependency;
let mediator: IMediator;

beforeEach(() => {
	dependency = new Dependency();
	const services = new ServiceCollection();
	addTransientCtor(
		services,
		Symbol.for('IRequestHandler<Ping>'),
		PingHandler,
	);
	addTransientCtor(
		services,
		Symbol.for('IRequestHandler<VoidPing>'),
		VoidPingHandler,
	);
	addTransientCtor(
		services,
		Symbol.for('IRequestHandler<GenericPing>'),
		GenericPingHandler,
	);
	addTransientCtor(
		services,
		Symbol.for('IRequestHandler<VoidGenericPing>'),
		VoidGenericPingHandler,
	);
	addMediatR(services, (cfg) => {});
	addSingletonInstance(services, Symbol.for('Dependency'), dependency);
	serviceProvider = buildServiceProvider(services);
	mediator = getRequiredService<IMediator>(serviceProvider, IMediator);
});

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L109
test('Should_resolve_main_handler', async () => {
	const response = await mediator.send<Ping>(
		((): Ping => {
			const ping = new Ping();
			ping.message = 'Ping';
			return ping;
		})(),
	);

	expect(response.message).toBe('Ping Pong');
});

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L117C23-L117C55
test('Should_resolve_main_void_handler', async () => {
	await mediator.send(new VoidPing());

	expect(dependency.called).toBe(true);
});

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L125C23-L125C71
test('Should_resolve_main_handler_via_dynamic_dispatch', async () => {
	const request = ((): Ping => {
		const ping = new Ping();
		ping.message = 'Ping';
		return ping;
	})();
	const response = await mediator.send<Pong>(request);

	const pong = response;
	expect(pong).toBeInstanceOf(Pong);
	expect(pong.message).toBe('Ping Pong');
});

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L135C23-L135C76
test('Should_resolve_main_void_handler_via_dynamic_dispatch', async () => {
	const request = new VoidPing();
	const response = await mediator.send<void>(request);

	expect(response).toBeUndefined();

	expect(dependency.called).toBe(true);
});

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L146C23-L146C72
test('Should_resolve_main_handler_by_specific_interface', async () => {
	const response = await mediator.send<Pong>(
		((): Ping => {
			const ping = new Ping();
			ping.message = 'Ping';
			return ping;
		})(),
	);

	expect(response.message).toBe('Ping Pong');
});

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L154C23-L154C69
test('Should_resolve_main_handler_by_given_interface', async () => {
	const requests = [new VoidPing()];
	await mediator.send(requests[0]);

	expect(dependency.called).toBe(true);
});

// TODO

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L167C23-L167C53
test('Should_resolve_generic_handler', async () => {
	const request = ((): GenericPing<Pong> => {
		const genericPong = new GenericPing<Pong>();
		genericPong.pong = ((): Pong => {
			const pong = new Pong();
			pong.message = 'Ping';
			return pong;
		})();
		return genericPong;
	})();
	const result = await mediator.send<Pong>(request);

	const pong = result;
	expect(pong).toBeInstanceOf(Pong);
	expect(pong.message).toBe('Ping Pong');

	expect(dependency.called).toBe(true);
});

// https://github.com/jbogard/MediatR/blob/1552d92a35081119a5fae9454b74b56ffdf046f6/test/MediatR.Tests/SendTests.cs#L179C23-L179C58
test('Should_resolve_generic_void_handler', async () => {
	const request = new VoidGenericPing<Pong>();
	await mediator.send(request);

	expect(dependency.called).toBe(true);
});
