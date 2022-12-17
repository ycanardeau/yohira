import { IHostBuilder } from '@yohira/hosting.abstractions/IHostBuilder';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostBuilder.cs,409816af9b4cc30f,references
export class GenericWebHostBuilder implements IWebHostBuilder {
	constructor(private readonly builder: IHostBuilder /* TODO: options */) {}

	configureServices = (
		configureServices: (/* TODO: context: WebHostBuilderContext */) => void,
	): this => {
		this.builder.configureServices(() => {
			// TODO
			throw new Error('Method not implemented.');
		});

		return this;
	};
}
