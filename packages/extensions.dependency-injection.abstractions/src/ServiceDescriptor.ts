import { Ctor, IServiceProvider, keyForType } from '@yohira/base';

import { ServiceLifetime } from './ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceDescriptor.cs,b593fd2837338f2a,references
export class ServiceDescriptor<T extends object = object> {
	private constructor(
		readonly lifetime: ServiceLifetime,
		readonly serviceType: symbol,
		readonly implCtor: Ctor<T> | undefined,
		readonly implInstance: T | undefined,
		readonly implFactory:
			| ((serviceProvider: IServiceProvider) => T)
			| undefined,
	) {}

	static fromCtor<T extends object>(
		lifetime: ServiceLifetime,
		serviceType: symbol,
		ctor: Ctor<T>,
	): ServiceDescriptor<T> {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			ctor,
			undefined,
			undefined,
		);
	}

	static fromInstance<T extends object>(
		lifetime: ServiceLifetime,
		serviceType: symbol,
		instance: T,
	): ServiceDescriptor<T> {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			undefined,
			instance,
			undefined,
		);
	}

	static fromFactory<T extends object>(
		lifetime: ServiceLifetime,
		serviceType: symbol,
		factory: (serviceProvider: IServiceProvider) => T,
	): ServiceDescriptor<T> {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			undefined,
			undefined,
			factory,
		);
	}

	toString(): string {
		const lifetime = `serviceType: ${keyForType(
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
