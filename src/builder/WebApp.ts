import { HostAppBuilder } from '@/hosting/HostAppBuilder';
import { IHost, runHost } from '@/hosting/IHost';

class WebApp implements IHost {
	constructor(private readonly host: IHost) {}

	start = (): Promise<void> => {
		return this.host.start();
	};

	private listen = (): void => {
		// IMPL
	};

	run = (): Promise<void> => {
		this.listen();
		return runHost(this);
	};
}

class WebAppBuilder {
	private readonly hostAppBuilder: HostAppBuilder;

	constructor() {
		this.hostAppBuilder = new HostAppBuilder(/* TODO */);
	}

	build = (): WebApp => {
		return new WebApp(this.hostAppBuilder.build());
	};
}

export const createWebAppBuilder = (): WebAppBuilder => {
	return new WebAppBuilder();
};
