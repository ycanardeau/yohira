import { Ctor, IServiceProvider } from '@yohira/base';

import { ServiceLifetime } from './ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceDescriptor.cs,b593fd2837338f2a,references
export class ServiceDescriptor {
	private constructor(
		readonly lifetime: ServiceLifetime,
		readonly serviceType: symbol,
		readonly implCtor: Ctor<object> | undefined,
		readonly implInstance: object | undefined,
		readonly implFactory:
			| ((serviceProvider: IServiceProvider) => object)
			| undefined,
	) {}

	static fromCtor(
		lifetime: ServiceLifetime,
		serviceType: symbol,
		ctor: Ctor<object>,
	): ServiceDescriptor {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			ctor,
			undefined,
			undefined,
		);
	}

	static fromInstance(
		lifetime: ServiceLifetime,
		serviceType: symbol,
		instance: object,
	): ServiceDescriptor {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			undefined,
			instance,
			undefined,
		);
	}

	static fromFactory<T>(
		lifetime: ServiceLifetime,
		serviceType: symbol,
		factory: (serviceProvider: IServiceProvider) => object,
	): ServiceDescriptor {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			undefined,
			undefined,
			factory,
		);
	}

	toString(): string {
		const lifetime = `serviceType: ${Symbol.keyFor(
			this.serviceType,
		)} lifetime: ${ServiceLifetime[this.lifetime]} `;

		if (this.implCtor !== undefined) {
			return `${lifetime}implCtor: ${this.implCtor.name}`;
		}

		if (this.implFactory !== undefined) {
			return `${lifetime}implFactory: ${this.implFactory}`;
		}

		return `${lifetime}implInstance: ${this.implInstance}`;
	}
}
