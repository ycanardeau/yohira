// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Hosting/Server.Abstractions/src/IHttpApplication.cs#L12
export interface IHttpApp<TContext> {
	createContext(/* TODO */): TContext;
	// TODO: disposeContext(context: TContext, error?: Error): void;
}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Hosting/Server.Abstractions/src/IServer.cs#L11
export interface IServer {
	start<TContext>(app: IHttpApp<TContext>): Promise<void>;
}
