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

	protect(data: TData, purpose?: string | undefined): string {
		const userData = this.serializer.serialize(data);

		let protector = this.protector;
		if (!!purpose) {
			protector = protector.createProtector(purpose);
		}

		const protectedData = protector.protect(userData);
		return protectedData.toString('base64url');
	}

	unprotect(
		protectedText: string | undefined,
		purpose?: string | undefined,
	): TData | undefined {
		try {
			if (protectedText === undefined) {
				return undefined;
			}

			const protectedData = Buffer.from(protectedText, 'base64url');
			// TODO

			let protector = this.protector;
			if (!!purpose) {
				protector = protector.createProtector(purpose);
			}

			const userData = protector.unprotect(protectedData);
			if (userData === undefined) {
				return undefined;
			}

			return this.serializer.deserialize(userData);
		} catch {
			// TODO trace exception, but do not leak other information
			return undefined;
		}
	}
}
