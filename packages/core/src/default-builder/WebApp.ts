import {
	IAsyncDisposable,
	ICollection,
	IServiceProvider,
	List,
} from '@yohira/base';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { IHost, runApp } from '@yohira/extensions.hosting.abstractions';
import { IWebHostEnv } from '@yohira/hosting.abstractions';
import { AppBuilder } from '@yohira/http';
import { IAppBuilder, RequestDelegate } from '@yohira/http.abstractions';
import { EndpointDataSource, IEndpointRouteBuilder } from '@yohira/routing';

import { WebAppBuilder } from './WebAppBuilder';

const globalEndpointRouteBuilderKey = '__GlobalEndpointRouteBuilder';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplication.cs,e41b5d12c49f9700,references
/**
 * The web application used to configure the HTTP pipeline, and routes.
 */
export class WebApp
	implements IHost, IAppBuilder, IEndpointRouteBuilder, IAsyncDisposable
{
	private readonly _dataSources = new List<EndpointDataSource>();
	get dataSources(): ICollection<EndpointDataSource> {
		return this._dataSources;
	}

	readonly appBuilder: IAppBuilder;

	get properties(): Map<string, unknown> {
		return this.appBuilder.properties;
	}

	constructor(private readonly host: IHost | (IHost & IAsyncDisposable)) {
		this.appBuilder = new AppBuilder(host.services /* TODO */);
		// TODO: logger

		this.properties.set(globalEndpointRouteBuilderKey, this);
	}

	/**
	 * The application's configured services.
	 */
	get services(): IServiceProvider {
		return this.host.services;
	}

	/**
	 * The application's configured {@link IWebHostEnv}.
	 */
	get env(): IWebHostEnv {
		return getRequiredService(
			this.host.services,
			Symbol.for('IWebHostEnv'),
		);
	}

	get appServices(): IServiceProvider {
		return this.appBuilder.appServices;
	}
	set appServices(value: IServiceProvider) {
		this.appBuilder.appServices = value;
	}

	/**
	 * Start the application.
	 * @returns A {@link Promise} that represents the startup of the {@link WebApp}.
	 * Successful completion indicates the HTTP server is ready to accept new requests.
	 */
	start(): Promise<void> {
		return this.host.start();
	}

	/**
	 * Shuts down the application.
	 * @returns A {@link Promise} that represents the shutdown of the {@link WebApp}.
	 * Successful completion indicates that all the HTTP server has stopped.
	 */
	stop(): Promise<void> {
		return this.host.stop();
	}

	dispose(): void {
		return this.host.dispose();
	}

	disposeAsync(): Promise<void> {
		return (this.host as IAsyncDisposable).disposeAsync();
	}

	/**
	 * Adds the middleware to the application request pipeline.
	 * @param middleware The middleware.
	 * @returns An instance of {@link IAppBuilder} after the operation has completed.
	 */
	use(middleware: (next: RequestDelegate) => RequestDelegate): this {
		this.appBuilder.use(middleware);
		return this;
	}

	build(): RequestDelegate {
		return this.appBuilder.build();
	}

	listen(): void {}

	/**
	 * Runs an application and returns a Promise that only completes when the token is triggered or shutdown is triggered.
	 * @returns A {@link Promise} that represents the entire runtime of the {@link WebApp} from startup to shutdown.
	 */
	run(): Promise<void> {
		this.listen();
		return runApp(this);
	}
}

export function createWebAppBuilder(): WebAppBuilder {
	return new WebAppBuilder(); /* TODO */
}
