import { ConfigManager } from '@yohira/extensions.config';
import { IHostEnv } from '@yohira/extensions.hosting.abstractions';

import { IResource } from './application-model/IResource';
import { IResourceBuilder } from './application-model/IResourceBuilder';

// https://github.com/dotnet/aspire/blob/900b1a2f244fca2ed263d86a7a5c583e0926af06/src/Aspire.Hosting/IDistributedApplicationBuilder.cs#L14
/**
 * A builder for creating instances of {@link DistributedApp}.
 */
export interface IDistributedAppBuilder {
	/**
	 * A collection of services for the application to compose. This is useful for adding user provided or framework provided services.
	 */
	readonly config: ConfigManager;
	/**
	 * Directory of the project where the app host is located. Defaults to the content root if there's no project.
	 */
	readonly appHostDirectory: string;
	/**
	 * Provides information about the hosting environment an application is running in.
	 */
	readonly env: IHostEnv;
	/**
	 * Adds a resource of type <typeparamref name="T"/> to the distributed application.
	 * @param resource The resource to add.
	 * @returns A builder for configuring the added resource.
	 */
	addResource<T extends IResource>(resource: T): IResourceBuilder<T>;
}
