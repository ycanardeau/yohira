import { IHostedService } from '@yohira/extensions.hosting.abstractions/IHostedService';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/ServiceCollectionHostedServiceExtensions.cs,7a9ac7b282b7b4d3,references
export const addHostedService = <THostedService extends IHostedService>(
	services: Container,
	hostedServiceType: new (...args: never[]) => THostedService,
): Container => {
	services.bind(IHostedService).to(hostedServiceType).inSingletonScope();

	return services;
};
