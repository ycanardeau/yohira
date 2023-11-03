import { IHttpApp } from './IHttpApp';

export const IServer = Symbol.for('IServer');
// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Server.Abstractions/IServer.cs,5aa0425d70e5445f,references
export interface IServer extends AsyncDisposable {
	start<TContext>(
		app: IHttpApp<TContext> /* TODO: cancellationToken */,
	): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
