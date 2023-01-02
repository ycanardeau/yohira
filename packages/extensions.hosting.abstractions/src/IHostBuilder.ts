import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHostBuilder.cs,32998cd8ca718d93,references
export interface IHostBuilder {
	configureServices(
		configureDelegate: (/* TODO */ services: IServiceCollection) => void,
	): this;
}
