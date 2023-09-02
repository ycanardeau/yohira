import { AuthenticationTicket } from '@yohira/authentication.abstractions';
import { IDataProtector } from '@yohira/data-protection.abstractions';

import { SecureDataFormat } from './SecureDataFormat';
import { TicketSerializer } from './TicketSerializer';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/TicketDataFormat.cs,26fd9a5b5bbf6566,references
/**
 * A {@link SecureDataFormat{TData}} instance to secure
 * {@link AuthenticationTicket}.
 */
export class TicketDataFormat extends SecureDataFormat<AuthenticationTicket> {
	constructor(protector: IDataProtector) {
		super(TicketSerializer.default, protector);
	}
}
