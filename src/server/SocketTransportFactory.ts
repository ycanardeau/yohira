import {
	IConnectionListener,
	IConnectionListenerFactory,
} from '@/connections/IConnectionListener';
import { SocketConnectionListener } from '@/server/SocketConnectionListener';
import { injectable } from 'inversify';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Transport.Sockets/src/SocketTransportFactory.cs#L14
@injectable()
export class SocketTransportFactory implements IConnectionListenerFactory {
	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Transport.Sockets/src/SocketTransportFactory.cs#L37
	bind = (): Promise<IConnectionListener> => {
		const transport = new SocketConnectionListener(/* TODO */);
		transport.bind();
		return Promise.resolve(transport);
	};
}
