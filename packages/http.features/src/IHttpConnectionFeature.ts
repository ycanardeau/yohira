import { IPAddress } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpConnectionFeature.cs,150611070f55b234,references
export const IHttpConnectionFeature = Symbol.for('IHttpConnectionFeature');
/**
 * Information regarding the TCP/IP connection carrying the request.
 */
export interface IHttpConnectionFeature {
	/**
	 * Gets or sets the unique identifier for the connection the request was received on. This is primarily for diagnostic purposes.
	 */
	connectionId: string;
	/**
	 * Gets or sets the IPAddress of the client making the request. Note this may be for a proxy rather than the end user.
	 */
	remoteIpAddress: IPAddress | undefined;
	/**
	 * Gets or sets the local IPAddress on which the request was received.
	 */
	localIpAddress: IPAddress | undefined;
	/**
	 * Gets or sets the remote port of the client making the request.
	 */
	remotePort: number;
	/**
	 * Gets or sets the local port on which the request was received.
	 */
	localPort: number;
}
