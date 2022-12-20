import { IHost } from '@yohira/hosting.abstractions/IHost';
import { Host } from '@yohira/hosting/internal/Host';
import { ILoggerFactory } from '@yohira/logging.abstractions/ILoggerFactory';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,328ee38355596558,references
export const resolveHost = (): IHost => {
	// TODO

	const host = new Host(
		container
			.get<ILoggerFactory>(ILoggerFactory)
			.createLogger(Host) /* TODO */,
	);

	// TODO

	return host;
};
