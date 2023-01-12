import { WebAppBuilder } from '@yohira/core/default-builder/WebAppBuilder';
import { run } from '@yohira/extensions.hosting.abstractions/HostingAbstractionsHostExtensions';
import { IHost } from '@yohira/extensions.hosting.abstractions/IHost';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';
import { AppBuilder } from '@yohira/http/builder/AppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplication.cs,e41b5d12c49f9700,references
export class WebApp implements IHost, IAppBuilder {
	readonly appBuilder: IAppBuilder;

	constructor(private readonly host: IHost) {
		this.appBuilder = new AppBuilder(/* TODO */);
	}

	start(): Promise<void> {
		return this.host.start();
	}

	stop(): Promise<void> {
		return this.host.stop();
	}

	dispose(): Promise<void> {
		return this.host.dispose();
	}

	use(middleware: (next: RequestDelegate) => RequestDelegate): this {
		this.appBuilder.use(middleware);
		return this;
	}

	build(): RequestDelegate {
		return this.appBuilder.build();
	}

	listen(): void {}

	run(): Promise<void> {
		this.listen();
		return run(this);
	}
}

export const createWebAppBuilder = (): WebAppBuilder => {
	return new WebAppBuilder(); /* TODO */
};
