import { ConnectionContext } from '@/connections/ConnectionContext';
import { IConnectionListener } from '@/connections/IConnectionListener';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Transport.Sockets/src/SocketConnectionListener.cs#L13
export class SocketConnectionListener implements IConnectionListener {
	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Transport.Sockets/src/SocketConnectionListener.cs#L34
	bind = (): void => {
		// IMPL
	};

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Transport.Sockets/src/SocketConnectionListener.cs#L59
	accept = async (): Promise<ConnectionContext> => {
		while (true) {
			// IMPL
		}
	};
}
