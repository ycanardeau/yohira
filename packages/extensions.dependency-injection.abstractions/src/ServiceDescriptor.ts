import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { Type } from '@yohira/base/Type';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceDescriptor.cs,b593fd2837338f2a,references
export class ServiceDescriptor<T = unknown> {
	private constructor(
		readonly lifetime: ServiceLifetime,
		readonly serviceType: Type,
		readonly implType: (new (...args: never[]) => T) | undefined,
		readonly implInstance: T | undefined,
		readonly implFactory:
			| ((serviceProvider: IServiceProvider) => T)
			| undefined,
	) {}

	static fromType = <T>(
		lifetime: ServiceLifetime,
		serviceType: Type,
		type: new (...args: never[]) => T,
	): ServiceDescriptor<T> => {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			type,
			undefined,
			undefined,
		);
	};

	static fromInstance = <T>(
		lifetime: ServiceLifetime,
		serviceType: Type,
		instance: T,
	): ServiceDescriptor<T> => {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			undefined,
			instance,
			undefined,
		);
	};

	static fromFactory = <T>(
		lifetime: ServiceLifetime,
		serviceType: Type,
		factory: (serviceProvider: IServiceProvider) => T,
	): ServiceDescriptor<T> => {
		return new ServiceDescriptor(
			lifetime,
			serviceType,
			undefined,
			undefined,
			factory,
		);
	};

	toString = (): string => {
		const lifetime = `serviceType: ${this.serviceType} lifetime: ${
			ServiceLifetime[this.lifetime]
		} `;

		if (this.implType !== undefined) {
			return `${lifetime}implType: ${this.implType.name}`;
		}

		if (this.implFactory !== undefined) {
			return `${lifetime}implFactory: ${this.implFactory}`;
		}

		return `${lifetime}implInstance: ${this.implInstance}`;
	};
}
