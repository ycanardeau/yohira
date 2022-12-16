import { IDisposable } from '@yohira/base/IDisposable';
import { IHttpApp } from '@yohira/hosting.server.abstractions/IHttpApp';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Server.Abstractions/IServer.cs,5aa0425d70e5445f,references
export const IServer = Symbol.for('IServer');
export interface IServer extends IDisposable {
	start<TContext>(
		app: IHttpApp<TContext> /* TODO: cancellationToken */,
	): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
