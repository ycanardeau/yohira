// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Connections.Abstractions/src/ConnectionDelegate.cs#L13
export type ConnectionDelegate =
	(/* TODO: connection: ConnectionContext */) => Promise<void>;

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Connections.Abstractions/src/IConnectionBuilder.cs#L11
export interface IConnectionBuilder {
	use(middleware: (next: ConnectionDelegate) => ConnectionDelegate): this;
	build(): ConnectionDelegate;
}
