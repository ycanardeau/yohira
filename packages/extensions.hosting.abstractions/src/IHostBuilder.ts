import { IConfigBuilder } from '@yohira/extensions.config.abstractions';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

import { HostBuilderContext } from './HostBuilderContext';
import { IHost } from './IHost';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHostBuilder.cs,32998cd8ca718d93,references
/**
 * A program initialization abstraction.
 */
export interface IHostBuilder {
	/**
	 * Set up the configuration for the builder itself. This will be used to initialize the {@link IHostEnv}
	 * for use later in the build process. This can be called multiple times and the results will be additive.
	 * @param configureDelegate The delegate for configuring the {@link IConfigBuilder} that will be used
	 * to construct the {@link IConfig} for the host.
	 * @returns The same instance of the {@link IHostBuilder} for chaining.
	 */
	configureHostConfig(
		configureDelegate: (config: IConfigBuilder) => void,
	): this;
	/**
	 * Adds services to the container. This can be called multiple times and the results will be additive.
	 * @param configureDelegate The delegate for configuring the <see cref="IServiceCollection"/> that will be used to construct the <see cref="IServiceProvider"/>.
	 * @returns The same instance of the {@link IHostBuilder} for chaining.
	 */
	configureServices(
		configureDelegate: (
			context: HostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this;
	/**
	 * Run the given actions to initialize the host. This can only be called once.
	 * @returns An initialized {@link IHost}.
	 */
	build(): IHost;
}
