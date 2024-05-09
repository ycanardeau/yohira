import { IPEndPoint } from '@yohira/base';
import { IFeatureCollection } from '@yohira/extensions.features';

import { ServiceContext } from './ServiceContext';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/BaseHttpConnectionContext.cs,de346a7eac2152b6,references
export class BaseHttpConnectionContext {
	constructor(
		readonly serviceContext: ServiceContext,
		readonly connectionFeatures: IFeatureCollection,
		readonly localEndPoint: IPEndPoint | undefined,
		readonly remoteEndPoint: IPEndPoint | undefined,
	) {}
}
