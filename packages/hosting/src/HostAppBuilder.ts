import { IHost } from '@yohira/hosting.abstractions/IHost';
import {
	populateServiceCollection,
	resolveHost,
} from '@yohira/hosting/HostBuilder';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostApplicationBuilder.cs,c659330adb7f1ad0,references
export class HostAppBuilder {
	readonly services = new Container();

	private hostBuilt = false;

	constructor() {
		// TODO

		populateServiceCollection(this.services);

		// TODO
	}

	build = (): IHost => {
		if (this.hostBuilt) {
			throw new Error('Build can only be called once.' /* LOC */);
		}
		this.hostBuilt = true;

		// TODO
		return resolveHost(this.services /* TODO */);
	};
}
