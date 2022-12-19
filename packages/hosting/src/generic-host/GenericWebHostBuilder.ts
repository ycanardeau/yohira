import { IHostBuilder } from '@yohira/hosting.abstractions/IHostBuilder';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { ISupportsStartup } from '@yohira/hosting/infrastructure/ISupportsStartup';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostBuilder.cs,409816af9b4cc30f,references
export class GenericWebHostBuilder
	implements IWebHostBuilder, ISupportsStartup
{
	private startupObject?: unknown;

	constructor(private readonly builder: IHostBuilder /* TODO: options */) {}

	configureServices = (
		configureServices: (/* TODO: context: WebHostBuilderContext */) => void,
	): this => {
		this.builder.configureServices(() => {
			// TODO: webHostBuilderContext
			configureServices(/* TODO */);
		});

		return this;
	};

	configure = (
		configure: (/* TODO */ app: IAppBuilder) => void,
	): IWebHostBuilder => {
		// TODO

		this.startupObject = configure;

		this.builder.configureServices((/* TODO */) => {
			if (this.startupObject === configure) {
				// TODO
			}
		});

		return this;
	};
}
