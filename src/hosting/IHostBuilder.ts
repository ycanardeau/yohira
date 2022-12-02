import { IServiceCollection } from '@/dependency-injection/ServiceCollection';

// https://github.com/dotnet/runtime/blob/bd7e1cb81d763589b95f7bfbaa2a96dd364e9103/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/IHostBuilder.cs#L14
export interface IHostBuilder {
	// https://github.com/dotnet/runtime/blob/bd7e1cb81d763589b95f7bfbaa2a96dd364e9103/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/IHostBuilder.cs#L46
	configureServices(
		configureDelegate: (
			// TODO: context: HostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this;
}
