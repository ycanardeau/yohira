import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonInstance,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	HostBuilderContext,
	IHostBuilder,
} from '@yohira/extensions.hosting.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';
import { IAppBuilder } from '@yohira/http.abstractions';

import { WebHostBuilderContext } from '../WebHostBuilderContext';
import { AppBuilderFactory } from '../builder/AppBuilderFactory';
import { GenericWebHostServiceOptions } from '../generic-host/GenericWebHostServiceOptions';
import { HttpContextFactory } from '../http/HttpContextFactory';
import { ISupportsStartup } from '../infrastructure/ISupportsStartup';
import { HostingEnv } from '../internal/HostingEnv';
import { initialize } from '../internal/HostingEnvExtensions';
import { WebHostOptions } from '../internal/WebHostOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostBuilder.cs,409816af9b4cc30f,references
export class GenericWebHostBuilder
	implements IWebHostBuilder, ISupportsStartup
{
	private startupObject?: unknown;

	private getWebHostBuilderContext(
		context: HostBuilderContext,
	): WebHostBuilderContext {
		const options = new WebHostOptions(context.config);
		const webHostBuilderContext = new WebHostBuilderContext(/* TODO */);
		// TODO
		webHostBuilderContext.hostingEnv = new HostingEnv();
		initialize(
			webHostBuilderContext.hostingEnv,
			context.hostingEnv.contentRootPath,
			options,
			context.hostingEnv,
		);
		// TODO
		return webHostBuilderContext;
	}

	constructor(private readonly builder: IHostBuilder /* TODO: options */) {
		// TODO

		builder.configureServices((context, services) => {
			const webHostContext = this.getWebHostBuilderContext(context);

			addSingletonInstance(
				services,
				Symbol.for('IWebHostEnv'),
				webHostContext.hostingEnv,
			);

			// TODO

			tryAddServiceDescriptor(
				services,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					Symbol.for('IHttpContextFactory'),
					HttpContextFactory,
				),
			);
			// TODO: IMiddlewareFactory
			tryAddServiceDescriptor(
				services,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					Symbol.for('IAppBuilderFactory'),
					AppBuilderFactory,
				),
			);

			// TODO
		});
	}

	configureServices(
		configureServices: (
			context: WebHostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this {
		this.builder.configureServices((context, builder) => {
			const webHostBuilderContext =
				this.getWebHostBuilderContext(context);
			configureServices(webHostBuilderContext, builder);
		});

		return this;
	}

	configure(
		configure: (/* TODO */ app: IAppBuilder) => void,
	): IWebHostBuilder {
		// TODO

		this.startupObject = configure;

		this.builder.configureServices((context, services) => {
			if (this.startupObject === configure) {
				configureOptionsServices(
					GenericWebHostServiceOptions,
					services,
					(options) => {
						options.configureApp = (app): void => configure(app);
					},
				);
			}
		});

		return this;
	}
}
