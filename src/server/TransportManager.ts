import { ConnectionDelegate } from '@/connections/IConnectionBuilder';
import { IConnectionListenerFactory } from '@/connections/IConnectionListener';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L17
export class TransportManager {
	constructor(
		private readonly transportFactories: IConnectionListenerFactory[],
	) {}

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/TransportManager.cs#L38
	bind = async (
		/* TODO */ connectionDelegate: ConnectionDelegate /* TODO */,
	): Promise<void> => {
		// TODO

		for (const transportFactory of this.transportFactories) {
		}

		throw new Error(
			/* TODO: InvalidOperationException */ `No registered IConnectionListenerFactory supports endpoint ${
				'' /* TODO */
			}: ${'' /* TODO: endPoint */}`,
		);
	};
}
