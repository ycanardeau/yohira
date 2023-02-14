import { IServiceProvider } from '@yohira/base';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/IServiceFactoryAdapter.cs,4281ee17b10a17e5,references
export interface IServiceFactoryAdapter {
	createBuilder(services: IServiceCollection): object;
	createServiceProvider(containerBuilder: object): IServiceProvider;
}
