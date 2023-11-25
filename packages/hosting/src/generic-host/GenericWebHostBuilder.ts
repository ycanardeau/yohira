import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonInstance,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IHostBuilder } from '@yohira/extensions.hosting.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';
import { IWebHostBuilder, IWebHostEnv } from '@yohira/hosting.abstractions';
import { IAppBuilder, IHttpContextFactory } from '@yohira/http.abstractions';

import { WebHostBuilderContext } from '../WebHostBuilderContext';
import { WebHostBuilderOptions } from '../WebHostBuilderOptions';
import { AppBuilderFactory } from '../builder/AppBuilderFactory';
import { IAppBuilderFactory } from '../builder/IAppBuilderFactory';
import { GenericWebHostServiceOptions } from '../generic-host/GenericWebHostServiceOptions';
import { HttpContextFactory } from '../http/HttpContextFactory';
import { ISupportsStartup } from '../infrastructure/ISupportsStartup';
import { WebHostBuilderBase } from './WebHostBuilderBase';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostBuilder.cs,409816af9b4cc30f,references
export class GenericWebHostBuilder
	extends WebHostBuilderBase
	implements ISupportsStartup
{
	private startupObject: unknown | undefined;

	constructor(builder: IHostBuilder, options: WebHostBuilderOptions) {
		super(builder, options);

		// TODO

		builder.configureServices((context, services) => {
			const webHostContext = this.getWebHostBuilderContext(context);

			addSingletonInstance(
				services,
				IWebHostEnv,
				webHostContext.hostingEnv,
			);

			// TODO

			tryAddServiceDescriptor(
				services,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					IHttpContextFactory,
					HttpContextFactory,
				),
			);
			// TODO: IMiddlewareFactory
			tryAddServiceDescriptor(
				services,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					IAppBuilderFactory,
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
