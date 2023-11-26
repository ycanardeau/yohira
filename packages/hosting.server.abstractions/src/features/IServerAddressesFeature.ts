import { ICollection } from '@yohira/base';

export const IServerAddressesFeature = Symbol.for('IServerAddressesFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Server.Abstractions/Features/IServerAddressesFeature.cs,305612bf65e4aea1,references
/**
 * Specifies the address used by the server.
 */
export interface IServerAddressesFeature {
	/**
	 * An {@link ICollection} of addresses used by the server.
	 */
	readonly addresses: ICollection<string>;

	/**
	 * <see langword="true" /> to prefer URLs configured by the host rather than the server.
	 */
	preferHostingUrls: boolean;
}
