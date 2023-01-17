import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/IWebHostBuilder.cs,5f2a269aacb82de6,references
export interface IWebHostBuilder {
	configureServices(
		configureServices: (
			/* TODO: context: WebHostBuilderContext, */ services: IServiceCollection,
		) => void,
	): this;
}
