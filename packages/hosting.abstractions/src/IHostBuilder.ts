import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHostBuilder.cs,32998cd8ca718d93,references
export interface IHostBuilder {
	configureServices(
		configureDelegate: (/* TODO */ services: Container) => void,
	): this;
}
