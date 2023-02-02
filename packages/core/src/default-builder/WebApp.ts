import { ICollection, IDisposable, IServiceProvider, List } from '@yohira/base';
import { IHost, runApp } from '@yohira/extensions.hosting.abstractions';
import { AppBuilder } from '@yohira/http';
import { IAppBuilder, RequestDelegate } from '@yohira/http.abstractions';
import { EndpointDataSource, IEndpointRouteBuilder } from '@yohira/routing';

import { WebAppBuilder } from './WebAppBuilder';

const globalEndpointRouteBuilderKey = '__GlobalEndpointRouteBuilder';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplication.cs,e41b5d12c49f9700,references
export class WebApp
	implements IHost, IAppBuilder, IEndpointRouteBuilder, IDisposable
{
	private readonly _dataSources = new List<EndpointDataSource>();
	get dataSources(): ICollection<EndpointDataSource> {
		return this._dataSources;
	}

	readonly appBuilder: IAppBuilder;

	get properties(): Map<string, unknown> {
		return this.appBuilder.properties;
	}

	constructor(private readonly host: IHost) {
		this.appBuilder = new AppBuilder(host.services /* TODO */);
		// TODO: logger

		this.properties.set(globalEndpointRouteBuilderKey, this);
	}

	get services(): IServiceProvider {
		return this.host.services;
	}

	get appServices(): IServiceProvider {
		return this.appBuilder.appServices;
	}
	set appServices(value: IServiceProvider) {
		this.appBuilder.appServices = value;
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
		return runApp(this);
	}
}

export function createWebAppBuilder(): WebAppBuilder {
	return new WebAppBuilder(); /* TODO */
}
