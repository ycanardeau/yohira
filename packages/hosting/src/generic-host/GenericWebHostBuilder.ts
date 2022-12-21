import { IHostBuilder } from '@yohira/extensions.hosting.abstractions/IHostBuilder';
import { configureOptionsServices } from '@yohira/extensions.options/OptionsServiceCollectionExtensions';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { AppBuilderFactory } from '@yohira/hosting/builder/AppBuilderFactory';
import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { GenericWebHostServiceOptions } from '@yohira/hosting/generic-host/GenericWebHostServiceOptions';
import { HttpContextFactory } from '@yohira/hosting/http/HttpContextFactory';
import { ISupportsStartup } from '@yohira/hosting/infrastructure/ISupportsStartup';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostBuilder.cs,409816af9b4cc30f,references
export class GenericWebHostBuilder
	implements IWebHostBuilder, ISupportsStartup
{
	private startupObject?: unknown;

	constructor(private readonly builder: IHostBuilder /* TODO: options */) {
		// TODO

		builder.configureServices((/* TODO */ services) => {
			// TODO

			services
				.bind(IAppBuilderFactory)
				.to(AppBuilderFactory)
				.inSingletonScope();
			// TODO: IMiddlewareFactory
			services
				.bind(IHttpContextFactory)
				.to(HttpContextFactory)
				.inSingletonScope();

			// TODO
		});
	}

	configureServices = (
		configureServices: (
			/* TODO: context: WebHostBuilderContext */ services: Container,
		) => void,
	): this => {
		this.builder.configureServices((/* TODO */ builder) => {
			// TODO: webHostBuilderContext
			configureServices(/* TODO */ builder);
		});

		return this;
	};

	configure = (
		configure: (/* TODO */ app: IAppBuilder) => void,
	): IWebHostBuilder => {
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
	};
}
