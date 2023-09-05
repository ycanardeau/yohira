import {
	AuthenticationTicket,
	ClaimsIdentity,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
import { BinaryReader, BinaryWriter, MemoryStream, using } from '@yohira/base';

import { IDataSerializer } from './IDataSerializer';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/TicketSerializer.cs,a06d70173f9793df,references
// This MUST be kept in sync with Microsoft.Owin.Security.Interop.AspNetTicketSerializer
/**
 * Serializes and deserializes {@link AuthenticationTicket} instances.
 */
export class TicketSerializer implements IDataSerializer<AuthenticationTicket> {
	private static readonly defaultStringPlaceholder = '\0';
	private static readonly formatVersion = 5;

	static readonly default = new TicketSerializer();

	write(writer: BinaryWriter, ticket: AuthenticationTicket): void {
		writer.writeInt32LE(TicketSerializer.formatVersion);
		writer.writeString(ticket.authenticationScheme);
	}

	serialize(ticket: AuthenticationTicket): Buffer {
		return using(MemoryStream.alloc(), (memory) => {
			using(new BinaryWriter(memory), (writer) => {
				this.write(writer, ticket);
			});
			return memory.toBuffer();
		});
	}

	private static readWithDefault(
		reader: BinaryReader,
		defaultValue: string,
	): string {
		const value = reader.readString();
		if (value === TicketSerializer.defaultStringPlaceholder /* REVIEW */) {
			return defaultValue;
		}
		return value;
	}

	protected readClaim(reader: BinaryReader, identity: ClaimsIdentity): Claim {
		// TODO
		throw new Error('Method not implemented.');
	}

	protected readIdentity(reader: BinaryReader): ClaimsIdentity {
		const authenticationType = reader.readString();
		const nameClaimType = TicketSerializer.readWithDefault(
			reader,
			ClaimsIdentity.defaultNameClaimType,
		);
		const roleClaimType = TicketSerializer.readWithDefault(
			reader,
			ClaimsIdentity.defaultRoleClaimType,
		);

		// Read the number of claims contained
		// in the serialized identity.
		const count = reader.readInt32LE();

		const identity = new ClaimsIdentity(
			undefined,
			undefined,
			authenticationType,
			nameClaimType,
			roleClaimType,
		);

		for (let index = 0; index !== count; ++index) {
			const claim = this.readClaim(reader, identity);

			identity.addClaim(claim);
		}

		// Determine whether the identity
		// has a bootstrap context attached.
		if (reader.readBoolean()) {
			identity.bootstrapContext = reader.readString();
		}

		// Determine whether the identity
		// has an actor identity attached.
		if (reader.readBoolean()) {
			identity.actor = this.readIdentity(reader);
		}

		return identity;
	}

	read(reader: BinaryReader): AuthenticationTicket | undefined {
		if (reader.readInt32LE() !== TicketSerializer.formatVersion) {
			return undefined;
		}

		const scheme = reader.readString();

		// Read the number of identities stored
		// in the serialized payload.
		const count = reader.readInt32LE();
		if (count < 0) {
			return undefined;
		}

		const identities: ClaimsIdentity[] = new Array(count);
		for (let index = 0; index !== count; ++index) {
			identities[index] = this.readIdentity(reader);
		}

		const properties = PropertiesSerializer.default.read(reader);

		return new AuthenticationTicket(
			ClaimsPrincipal.fromIdentities(identities),
			properties,
			scheme,
		);
	}

	deserialize(data: Buffer): AuthenticationTicket | undefined {
		return using(MemoryStream.from(data, 0, data.length), (memory) => {
			return using(new BinaryReader(memory), (reader) => {
				return this.read(reader);
			});
		});
	}
}
