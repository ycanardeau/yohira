import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { IHost } from '@yohira/extensions.hosting.abstractions';
import { IServer } from '@yohira/hosting.server.abstractions';

import { TestServer } from './TestServer';

// https://source.dot.net/#Microsoft.AspNetCore.TestHost/HostBuilderTestServerExtensions.cs,f2748d9e1562febb,references
/**
 * Retrieves the TestServer from the host services.
 * @param host
 * @returns
 */
export function getTestServer(host: IHost): TestServer {
	return getRequiredService<IServer>(host.services, IServer) as TestServer;
}
