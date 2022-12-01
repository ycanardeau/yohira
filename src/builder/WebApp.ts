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
	build = (): WebApp => {
		const host: IHost = {
			start: async (): Promise<void> => {
				console.log('start');
			},
		}; /* IMPL */
		return new WebApp(host);
	};
}

export const createWebAppBuilder = (): WebAppBuilder => {
	return new WebAppBuilder();
};
