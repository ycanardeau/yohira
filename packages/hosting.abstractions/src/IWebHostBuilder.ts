import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

import { WebHostBuilderContext } from './WebHostBuilderContext';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/IWebHostBuilder.cs,5f2a269aacb82de6,references
export interface IWebHostBuilder {
	configureServices(
		configureServices: (
			context: WebHostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this;
	useSetting(key: string, value: string | undefined): this;
}
