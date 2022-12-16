import { WebApp } from '@yohira/core/default-builder/WebApp';
import { HostAppBuilder } from '@yohira/hosting/HostAppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplicationBuilder.cs,25a352b50e81d95b,references
export class WebAppBuilder {
	private readonly hostAppBuilder: HostAppBuilder;

	private builtApp?: WebApp;

	constructor() {
		this.hostAppBuilder = new HostAppBuilder(/* TODO */);
	}

	build = (): WebApp => {
		// TODO
		this.builtApp = new WebApp(this.hostAppBuilder.build());
		return this.builtApp;
	};
}
