import { IDisposable } from '@yohira/base';

import { IHttpApp } from './IHttpApp';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Server.Abstractions/IServer.cs,5aa0425d70e5445f,references
export interface IServer extends IDisposable {
	start<TContext>(
		app: IHttpApp<TContext> /* TODO: cancellationToken */,
	): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
