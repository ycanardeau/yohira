import { addSingletonCtor } from '@yohira/extensions.dependency-injection.abstractions';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';
import { IServer } from '@yohira/hosting.server.abstractions';
import { TestServer } from '@yohira/test-host';

// https://source.dot.net/#Microsoft.AspNetCore.TestHost/WebHostBuilderExtensions.cs,a49945a3163a7df6,references
/**
 * Enables the {@link TestServer} service.
 * @param builder The {@link IWebHostBuilder}.
 * @returns The {@link IWebHostBuilder}.
 */
export function useTestServer(builder: IWebHostBuilder): IWebHostBuilder {
	return builder.configureServices((_, services) => {
		// TODO: addSingletonCtor(services, IHostLifetime, NoopHostLifetime);
		addSingletonCtor(services, IServer, TestServer);
	});
}
