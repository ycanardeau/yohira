import {
	ConnectionDelegate,
	IConnectionBuilder,
} from '@/connections/IConnectionBuilder';
import { AddressBindContext } from '@/server/AddressBindContext';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/AddressBinder.cs#L85
const bindEndpoint = async (
	endpoint: ListenOptions,
	context: AddressBindContext,
): Promise<void> => {
	// TODO: Try.
	await context.createBinding(endpoint);
	// TODO: Catch.

	// TODO
};

type EndPoint = unknown /* TODO */;

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/ListenOptions.cs#L17
export class ListenOptions implements IConnectionBuilder {
	private readonly middleware: ((
		next: ConnectionDelegate,
	) => ConnectionDelegate)[] = [];

	constructor(public endPoint: EndPoint) {}

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/ListenOptions.cs#L140
	use = (
		middleware: (next: ConnectionDelegate) => ConnectionDelegate,
	): this => {
		this.middleware.push(middleware);
		return this;
	};

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/ListenOptions.cs#L156
	build = (): ConnectionDelegate => {
		let app: ConnectionDelegate = (): Promise<void> => {
			return Promise.resolve();
		};

		for (let i = this.middleware.length - 1; i >= 0; i--) {
			const component = this.middleware[i];
			app = component(app);
		}

		return app;
	};

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/ListenOptions.cs#L188
	bind = async (context: AddressBindContext): Promise<void> => {
		await bindEndpoint(this, context);
		// TODO
	};
}
