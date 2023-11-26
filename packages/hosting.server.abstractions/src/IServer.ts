import { IFeatureCollection } from '@yohira/extensions.features';

import { IHttpApp } from './IHttpApp';

export const IServer = Symbol.for('IServer');
// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Server.Abstractions/IServer.cs,5aa0425d70e5445f,references
export interface IServer extends AsyncDisposable {
	/**
	 * A collection of HTTP features of the server.
	 */
	readonly features: IFeatureCollection;
	start<TContext>(
		app: IHttpApp<TContext>,
		// TODO: cancellationToken,
	): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
