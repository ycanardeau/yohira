import { Host } from '@/hosting/Host';
import { IHost } from '@/hosting/IHost';
import { Container } from 'inversify';

// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostBuilder.cs#L356
const resolveHost = (serviceProvider: Container): IHost => {
	// TODO
	const host = new Host(serviceProvider, { isEnabled: () => true });

	return host;
};

// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostApplicationBuilder.cs#L20
export class HostAppBuilder {
	private createServiceProvider: () => Container;

	private appServices?: Container;

	constructor() {
		this.createServiceProvider = (): Container => {
			return new Container() /* TODO */;
		};
	}

	// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostApplicationBuilder.cs#L214
	build = (): IHost => {
		this.appServices = this.createServiceProvider();

		return resolveHost(this.appServices /* TODO */);
	};
}
