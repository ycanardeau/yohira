import { IHost } from '@yohira/hosting.abstractions/IHost';
import { resolveHost } from '@yohira/hosting/HostBuilder';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostApplicationBuilder.cs,c659330adb7f1ad0,references
export class HostAppBuilder {
	private hostBuilt = false;

	build = (): IHost => {
		if (this.hostBuilt) {
			throw new Error('Build can only be called once.' /* LOC */);
		}
		this.hostBuilt = true;

		// TODO
		return resolveHost(/* TODO */);
	};
}
