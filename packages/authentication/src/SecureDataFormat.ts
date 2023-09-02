import { IDataProtector } from '@yohira/data-protection.abstractions';

import { IDataSerializer } from './IDataSerializer';
import { ISecureDataFormat } from './ISecureDataFormat';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/SecureDataFormat.cs,c305019b60974361,references
/**
 * An implementation for <see cref="ISecureDataFormat{TData}"/>.
 */
export class SecureDataFormat<TData> implements ISecureDataFormat<TData> {
	constructor(
		private readonly serializer: IDataSerializer<TData>,
		private readonly protector: IDataProtector,
	) {}

	unprotect(
		protectedText: string | undefined,
		purpose?: string | undefined,
	): TData | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}
}
