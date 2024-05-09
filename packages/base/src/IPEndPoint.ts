import { IPAddress } from './IPAddress';

// https://source.dot.net/#System.Net.Primitives/System/Net/IPEndPoint.cs,41014a34ee3fc77a,references
/**
 * Provides an IP address.
 */
export class IPEndPoint {
	constructor(
		readonly address: IPAddress,
		readonly port: number,
	) {}
}
