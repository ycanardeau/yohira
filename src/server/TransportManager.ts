import { BaseConnectionContext } from '@/connections/BaseConnectionContext';
import { ConnectionContext } from '@/connections/ConnectionContext';
import { ConnectionDelegate } from '@/connections/IConnectionBuilder';
import {
	IConnectionListener,
	IConnectionListenerFactory,
} from '@/connections/IConnectionListener';
import { ConnectionDispatcher } from '@/server/ConnectionDispatcher';
import {
	IConnectionListenerBase,
	IConnectionListener as IConnectionListenerOfT,
} from '@/server/IConnectionListener';
import { TransportConnectionManager } from '@/server/TransportConnectionManager';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L227
class ActiveTransport /* TODO: implements IAsyncDisposable */ {
	constructor(
		transport: IConnectionListenerBase,
		readonly acceptLoopPromise: Promise<void>,
		readonly transportConnectionManager: TransportConnectionManager,
	) {}
}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L255
class GenericConnectionListener
	implements IConnectionListenerOfT<ConnectionContext>
{
	constructor(private readonly connectionListener: IConnectionListener) {}

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L266
	accept = (): Promise<ConnectionContext | undefined> => {
		return this.connectionListener.accept();
	};
}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L17
export class TransportManager {
	private readonly transports: ActiveTransport[] = [];

	constructor(
		private readonly transportFactories: IConnectionListenerFactory[],
	) {}

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L163
	private startAcceptLoop = <T extends BaseConnectionContext>(
		connectionListener: IConnectionListenerOfT<T> /* TODO */,
		connectionDelegate: (connection: T) => Promise<void>,
	): void => {
		const transportConnectionManager =
			new TransportConnectionManager(/* TODO */);
		const connectionDispatcher = new ConnectionDispatcher<T>(
			/* TODO */
			connectionDelegate,
			transportConnectionManager,
		);
		const acceptLoopPromise =
			connectionDispatcher.startAcceptingConnections(connectionListener);

		this.transports.push(
			new ActiveTransport(
				connectionListener,
				acceptLoopPromise,
				transportConnectionManager,
				/* TODO */
			),
		);
	};

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L38
	bind = async (
		/* TODO */ connectionDelegate: ConnectionDelegate /* TODO */,
	): Promise<void /* TODO */> => {
		// TODO

		for (const transportFactory of this.transportFactories) {
			// TODO
			if (true /* TODO */) {
				const transport = await transportFactory.bind(/* TODO */);
				this.startAcceptLoop(
					new GenericConnectionListener(transport),
					(c) => connectionDelegate(c) /* TODO */,
				);
				return /* TODO */;
			}
		}

		throw new Error(
			/* TODO: InvalidOperationException */ `No registered IConnectionListenerFactory supports endpoint ${
				'' /* TODO */
			}: ${'' /* TODO: endPoint */}`,
		);
	};
}
