// https://source.dot.net/#System.Net.Primitives/System/Net/IPAddress.cs,966bd1c3b2dc55c7,references
/**
 * Provides an Internet Protocol (IP) address.
 */
export class IPAddress {
	constructor(
		readonly family: 'IPv4' | 'IPv6',
		readonly address: string,
	) {}
}
