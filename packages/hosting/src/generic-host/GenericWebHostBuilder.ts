import { AppBuilderFactory } from '@/builder/AppBuilderFactory';
import { GenericWebHostServiceOptions } from '@/generic-host/GenericWebHostServiceOptions';
import { HttpContextFactory } from '@/http/HttpContextFactory';
import { ISupportsStartup } from '@/infrastructure/ISupportsStartup';
import { Type } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAdd,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IHostBuilder } from '@yohira/extensions.hosting.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';
import { IAppBuilder } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostBuilder.cs,409816af9b4cc30f,references
export class GenericWebHostBuilder
	implements IWebHostBuilder, ISupportsStartup
{
	private startupObject?: unknown;

	constructor(private readonly builder: IHostBuilder /* TODO: options */) {
		// TODO

		builder.configureServices((/* TODO */ services) => {
			// TODO

			tryAdd(
				services,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					Type.from('IHttpContextFactory'),
					HttpContextFactory,
				),
			);
			// TODO: IMiddlewareFactory
			tryAdd(
				services,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					Type.from('IAppBuilderFactory'),
					AppBuilderFactory,
				),
			);

			// TODO
		});
	}

	configureServices(
		configureServices: (
			/* TODO: context: WebHostBuilderContext */ services: IServiceCollection,
		) => void,
	): this {
		this.builder.configureServices((/* TODO */ builder) => {
			// TODO: webHostBuilderContext
			configureServices(/* TODO */ builder);
		});

		return this;
	}

	configure(
		configure: (/* TODO */ app: IAppBuilder) => void,
	): IWebHostBuilder {
		// TODO

		this.startupObject = configure;

		this.builder.configureServices((/* TODO */ services) => {
			if (this.startupObject === configure) {
				configureOptionsServices(
					services,
					GenericWebHostServiceOptions,
					(options) => {
						options.configureApp = (app): void => configure(app);
					},
				);
			}
		});

		return this;
	}
}
