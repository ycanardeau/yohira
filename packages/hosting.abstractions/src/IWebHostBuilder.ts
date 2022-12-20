import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/IWebHostBuilder.cs,5f2a269aacb82de6,references
export interface IWebHostBuilder {
	configureServices(
		configureServices: (
			/* TODO: context: WebHostBuilderContext, */ services: Container,
		) => void,
	): this;
}
