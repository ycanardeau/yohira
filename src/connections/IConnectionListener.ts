// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Connections.Abstractions/src/IConnectionListener.cs#L14
export interface IConnectionListener {}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Connections.Abstractions/src/IConnectionListenerFactory.cs#L13
export interface IConnectionListenerFactory {
	bind(/* TODO */): Promise<IConnectionListener>;
}
