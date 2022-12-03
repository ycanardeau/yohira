import {
	ServiceDescriptor,
	ServiceLifetime,
} from '@/dependency-injection/ServiceDescriptor';
import { Container } from 'inversify';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/System.ComponentModel/src/System/IServiceProvider.cs#L6
export interface IServiceProvider {
	getRequiredService<T>(type: symbol): T;
	getRequiredServices<T>(type: symbol): T[];
}

// https://github.com/dotnet/runtime/blob/cb52e3b88177cb86929b829d92b03561ad4e806b/src/libraries/Microsoft.Extensions.DependencyInjection/src/ServiceProvider.cs#L17
export class ServiceProvider implements IServiceProvider {
	private readonly container = new Container();

	constructor(serviceDescriptors: ServiceDescriptor[] /* TODO */) {
		for (const serviceDescriptor of serviceDescriptors) {
			const binding =
				'implementationType' in serviceDescriptor
					? this.container
							.bind(serviceDescriptor.serviceType)
							.to(serviceDescriptor.implementationType)
					: this.container
							.bind(serviceDescriptor.serviceType)
							.toDynamicValue(
								() => serviceDescriptor.implementationInstance,
							);

			if (serviceDescriptor.T) {
				binding.whenTargetNamed(serviceDescriptor.T);
			}

			switch (serviceDescriptor.lifetime) {
				case ServiceLifetime.Singleton:
					binding.inSingletonScope();
					break;

				case ServiceLifetime.Scoped:
					binding.inRequestScope();
					break;

				case ServiceLifetime.Transient:
					binding.inTransientScope();
					break;
			}
		}
	}

	getRequiredService = <T>(type: symbol): T => {
		return this.container.get(type);
	};

	getRequiredServices = <T>(type: symbol): T[] => {
		return this.container.getAll(type);
	};
}
