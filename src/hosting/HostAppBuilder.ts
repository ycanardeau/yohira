import { Host } from '@/hosting/Host';
import { IHost } from '@/hosting/IHost';

// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostBuilder.cs#L356
const resolveHost = (): IHost => {
	return new Host({ isEnabled: () => true }); /* IMPL */
};

// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostApplicationBuilder.cs#L20
export class HostAppBuilder {
	// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostApplicationBuilder.cs#L324
	build = (): IHost => {
		return resolveHost(/* TODO */);
	};
}
