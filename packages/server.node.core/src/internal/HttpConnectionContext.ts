import { IFeatureCollection } from '@yohira/extensions.features';
import { Readable, Writable } from 'node:stream';

import { BaseHttpConnectionContext } from './BaseHttpConnectionContext';
import { ServiceContext } from './ServiceContext';

// https://source.dot.net/#System.IO.Pipelines/System/IO/Pipelines/IDuplexPipe.cs,7b5aeef28b9087ea,references
/**
 * Defines a class that provides a duplex pipe from which data can be read from and written to.
 */
export interface IDuplexPipe {
	/**
	 * Gets the {@link Readable} half of the duplex pipe.
	 */
	input: Readable;
	/**
	 * Gets the {@link Writable} half of the duplex pipe.
	 */
	output: Writable;
}

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/HttpConnectionContext.cs,57c4596a48c438ec,references
export class HttpConnectionContext extends BaseHttpConnectionContext {
	transport!: IDuplexPipe;

	constructor(
		serviceContext: ServiceContext,
		connectionFeatures: IFeatureCollection,
	) {
		super(serviceContext, connectionFeatures);
	}
}
