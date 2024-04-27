import { AuthenticationTicket } from '@yohira/authentication.abstractions';
import {
	BinaryReader,
	BinaryWriter,
	Claim,
	ClaimValueTypes,
	ClaimsIdentity,
	ClaimsPrincipal,
	MemoryStream,
	using,
} from '@yohira/base';

import { IDataSerializer } from './IDataSerializer';
import { PropertiesSerializer } from './PropertiesSerializer';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/TicketSerializer.cs,a06d70173f9793df,references
// This MUST be kept in sync with Microsoft.Owin.Security.Interop.AspNetTicketSerializer
/**
 * Serializes and deserializes {@link AuthenticationTicket} instances.
 */
export class TicketSerializer implements IDataSerializer<AuthenticationTicket> {
	private static readonly defaultStringPlaceholder = '\0';
	private static readonly formatVersion = 5;

	static readonly default = new TicketSerializer();

	private static writeWithDefault(
		writer: BinaryWriter,
		value: string,
		defaultValue: string,
	): void {
		if (value === defaultValue) {
			writer.writeString(TicketSerializer.defaultStringPlaceholder);
		} else {
			writer.writeString(value);
		}
	}

	protected writeClaim(writer: BinaryWriter, claim: Claim): void {
		TicketSerializer.writeWithDefault(
			writer,
			claim.type,
			claim.subject?.nameClaimType ?? ClaimsIdentity.defaultNameClaimType,
		);
		writer.writeString(claim.value);
		TicketSerializer.writeWithDefault(
			writer,
			claim.valueType,
			ClaimValueTypes.string,
		);
		TicketSerializer.writeWithDefault(
			writer,
			claim.issuer,
			ClaimsIdentity.defaultIssuer,
		);
		TicketSerializer.writeWithDefault(
			writer,
			claim.originalIssuer,
			claim.issuer,
		);

		// Write the number of properties contained in the claim.
		writer.writeInt32LE(claim.properties.size);

		for (const [key, value] of claim.properties) {
			writer.writeString(key ?? '');
			writer.writeString(value ?? '');
		}
	}

	protected writeIdentity(
		writer: BinaryWriter,
		identity: ClaimsIdentity,
	): void {
		const authenticationType = identity.authenticationType ?? '';

		writer.writeString(authenticationType);
		TicketSerializer.writeWithDefault(
			writer,
			identity.nameClaimType,
			ClaimsIdentity.defaultNameClaimType,
		);
		TicketSerializer.writeWithDefault(
			writer,
			identity.roleClaimType,
			ClaimsIdentity.defaultRoleClaimType,
		);

		// Write the number of claims contained in the identity.
		writer.writeInt32LE(Array.from(identity.claims).length);

		for (const claim of identity.claims) {
			this.writeClaim(writer, claim);
		}

		const bootstrap = identity.bootstrapContext as string;
		if (!!bootstrap) {
			writer.writeBoolean(true);
			writer.writeString(bootstrap);
		} else {
			writer.writeBoolean(false);
		}

		if (identity.actor !== undefined) {
			writer.writeBoolean(true);
			this.writeIdentity(writer, identity.actor);
		} else {
			writer.writeBoolean(false);
		}
	}

	write(writer: BinaryWriter, ticket: AuthenticationTicket): void {
		writer.writeInt32LE(TicketSerializer.formatVersion);
		writer.writeString(ticket.authenticationScheme);

		// Write the number of identities contained in the principal.
		const principal = ticket.principal;
		writer.writeInt32LE(principal.identities.length);

		for (const identity of principal.identities) {
			this.writeIdentity(writer, identity);
		}

		PropertiesSerializer.default.write(writer, ticket.properties);
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
		const type = TicketSerializer.readWithDefault(
			reader,
			identity.nameClaimType,
		);
		const value = reader.readString();
		const valueType = TicketSerializer.readWithDefault(
			reader,
			ClaimValueTypes.string,
		);
		const issuer = TicketSerializer.readWithDefault(
			reader,
			ClaimsIdentity.defaultIssuer,
		);
		const originalIssuer = TicketSerializer.readWithDefault(reader, issuer);

		const claim = new Claim(
			type,
			value,
			valueType,
			issuer,
			originalIssuer,
			identity,
		);

		// Read the number of properties stored in the claim.
		const count = reader.readInt32LE();

		for (let index = 0; index !== count; ++index) {
			const key = reader.readString();
			const propertyValue = reader.readString();

			claim.properties.set(key, propertyValue);
		}

		return claim;
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
