import { ICollection, List } from '@yohira/base';
import { IServerAddressesFeature } from '@yohira/hosting.server.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Server/Features/ServerAddressesFeature.cs,4daf85c00af56c01,references
/**
 * Specifies the address used by the server.
 */
export class ServerAddressesFeature implements IServerAddressesFeature {
	readonly addresses: ICollection<string> = new List<string>();
	preferHostingUrls = false;
}
