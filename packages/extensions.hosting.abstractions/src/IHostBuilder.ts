import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

import { HostBuilderContext } from './HostBuilderContext';
import { IHost } from './IHost';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHostBuilder.cs,32998cd8ca718d93,references
export interface IHostBuilder {
	configureServices(
		configureDelegate: (
			context: HostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this;
	build(): IHost;
}
