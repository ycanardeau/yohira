import { IPAddress } from '@yohira/base';
import { IHttpConnectionFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/HttpConnectionFeature.cs,06bbfdbd3ac2c97a,references
/**
 * Default implementation for {@link IHttpConnectionFeature}.
 */
export class HttpConnectionFeature implements IHttpConnectionFeature {
	connectionId!: string;
	localIpAddress: IPAddress | undefined;
	localPort = 0;
	remoteIpAddress: IPAddress | undefined;
	remotePort = 0;
}
