import { BaseConnectionContext } from '@/connections/BaseConnectionContext';
import { IConnectionListener } from '@/server/IConnectionListener';
import { TransportConnectionManager } from '@/server/TransportConnectionManager';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/ConnectionDispatcher.cs#L10
export class ConnectionDispatcher<T extends BaseConnectionContext> {
	constructor(
		private readonly connectionDelegate: (connection: T) => Promise<void>,
		private readonly transportConnectionManager: TransportConnectionManager,
	) {}

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/ConnectionDispatcher.cs#L26
	startAcceptingConnections = (
		listener: IConnectionListener<T>,
	): Promise<void> => {
		return Promise.resolve(); /* TODO */
	};
}
