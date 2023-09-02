import { AuthenticationTicket } from '@yohira/authentication.abstractions';

import { IDataSerializer } from './IDataSerializer';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/TicketSerializer.cs,a06d70173f9793df,references
// This MUST be kept in sync with Microsoft.Owin.Security.Interop.AspNetTicketSerializer
/**
 * Serializes and deserializes {@link AuthenticationTicket} instances.
 */
export class TicketSerializer implements IDataSerializer<AuthenticationTicket> {
	static readonly default = new TicketSerializer();

	serialize(model: AuthenticationTicket): Buffer {
		// TODO
		throw new Error('Method not implemented.');
	}

	deserialize(data: Buffer): AuthenticationTicket | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}
}
