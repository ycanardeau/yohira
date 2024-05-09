import { IPAddress } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/ConnectionInfo.cs,a6673d2d98d0f5b1,references
/**
 * Represents the underlying connection for a request.
 */
export interface IConnectionInfo {
	remoteIpAddress: IPAddress | undefined;
	/**
	 * Gets or sets the port of the remote target.
	 */
	remotePort: number;
	/**
	 * Gets or sets the IP address of the local host.
	 */
	localIpAddress: IPAddress | undefined;
	/**
	 * Gets or sets the port of the local host.
	 */
	localPort: number;
}
