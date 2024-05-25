import { TicketSerializer } from '@yohira/authentication';
import {
	AuthenticationProperties,
	AuthenticationTicket,
} from '@yohira/authentication.abstractions';
import {
	BinaryReader,
	BinaryWriter,
	Claim,
	ClaimsIdentity,
	ClaimsPrincipal,
	MemoryStream,
	using,
} from '@yohira/base';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/00d0038f937f0059a847fde504649fe33ec935e0/src/Security/Authentication/test/TicketSerializerTests.cs#L12
test('CanRoundTripEmptyPrincipal', () => {
	const serializer = new TicketSerializer();
	const properties = AuthenticationProperties.create();
	properties.redirectUri = 'bye';
	const ticket = new AuthenticationTicket(
		new ClaimsPrincipal(),
		properties,
		'Hello',
	);

	using(MemoryStream.alloc(), (stream) => {
		using(new BinaryWriter(stream), (writer) => {
			using(new BinaryReader(stream), (reader) => {
				serializer.write(writer, ticket);
				stream.position = 0;
				const readTicket = serializer.read(reader)!;
				expect(readTicket.principal.identities.length).toBe(0);
				expect(readTicket.properties.redirectUri).toBe('bye');
				expect(readTicket.authenticationScheme).toBe('Hello');
			});
		});
	});
});

// https://github.com/dotnet/aspnetcore/blob/00d0038f937f0059a847fde504649fe33ec935e0/src/Security/Authentication/test/TicketSerializerTests.cs#L33
test('CanRoundTripBootstrapContext', () => {
	const serializer = new TicketSerializer();
	const properties = AuthenticationProperties.create();

	const ticket = new AuthenticationTicket(
		new ClaimsPrincipal(),
		properties,
		'Hello',
	);
	ticket.principal.addIdentity(
		((): ClaimsIdentity => {
			const identity = new ClaimsIdentity(
				undefined,
				undefined,
				'misc',
				undefined,
				undefined,
			);
			identity.bootstrapContext = 'bootstrap';
			return identity;
		})(),
	);

	using(MemoryStream.alloc(), (stream) => {
		using(new BinaryWriter(stream), (writer) => {
			using(new BinaryReader(stream), (reader) => {
				serializer.write(writer, ticket);
				stream.position = 0;
				const readTicket = serializer.read(reader)!;
				expect(readTicket.principal.identities.length).toBe(1);
				expect(readTicket.principal.identity?.authenticationType).toBe(
					'misc',
				);
				expect(
					readTicket.principal.identities[0].bootstrapContext,
				).toBe('bootstrap');
			});
		});
	});
});

// https://github.com/dotnet/aspnetcore/blob/00d0038f937f0059a847fde504649fe33ec935e0/src/Security/Authentication/test/TicketSerializerTests.cs#L55
test('CanRoundTripActorIdentity', () => {
	const serializer = new TicketSerializer();
	const properties = AuthenticationProperties.create();

	const actor = new ClaimsIdentity(
		undefined,
		undefined,
		'actor',
		undefined,
		undefined,
	);
	const ticket = new AuthenticationTicket(
		new ClaimsPrincipal(),
		properties,
		'Hello',
	);
	ticket.principal.addIdentity(
		((): ClaimsIdentity => {
			const identity = new ClaimsIdentity(
				undefined,
				undefined,
				'misc',
				undefined,
				undefined,
			);
			identity.actor = actor;
			return identity;
		})(),
	);

	using(MemoryStream.alloc(), (stream) => {
		using(new BinaryWriter(stream), (writer) => {
			using(new BinaryReader(stream), (reader) => {
				serializer.write(writer, ticket);
				stream.position = 0;
				const readTicket = serializer.read(reader)!;
				expect(readTicket.principal.identities.length).toBe(1);
				expect(readTicket.principal.identity?.authenticationType).toBe(
					'misc',
				);

				const identity = readTicket.principal
					.identity as ClaimsIdentity;
				expect(identity.actor).not.toBeUndefined();
				expect(identity.actor!.authenticationType).toBe('actor');
			});
		});
	});
});

// https://github.com/dotnet/aspnetcore/blob/00d0038f937f0059a847fde504649fe33ec935e0/src/Security/Authentication/test/TicketSerializerTests.cs#L84
test('CanRoundTripClaimProperties', () => {
	const serializer = new TicketSerializer();
	const properties = AuthenticationProperties.create();

	const claim = new Claim(
		'type',
		'value',
		'valueType',
		'issuer',
		'original-issuer',
	);
	claim.properties.set('property-1', 'property-value');

	// Note: a null value MUST NOT result in a crash
	// and MUST instead be treated like an empty string.
	claim.properties.set('property-2', undefined!);

	const ticket = new AuthenticationTicket(
		new ClaimsPrincipal(),
		properties,
		'Hello',
	);
	ticket.principal.addIdentity(
		new ClaimsIdentity(undefined, [claim], 'misc', undefined, undefined),
	);

	using(MemoryStream.alloc(), (stream) => {
		using(new BinaryWriter(stream), (writer) => {
			using(new BinaryReader(stream), (reader) => {
				serializer.write(writer, ticket);
				stream.position = 0;
				const readTicket = serializer.read(reader)!;
				expect(readTicket.principal.identities.length).toBe(1);
				expect(readTicket.principal.identity?.authenticationType).toBe(
					'misc',
				);

				const readClaim = readTicket.principal.findFirst('type')!;
				expect(claim).not.toBeUndefined();
				expect(claim.type).toBe('type');
				expect(claim.value).toBe('value');
				expect(claim.valueType).toBe('valueType');
				expect(claim.issuer).toBe('issuer');
				expect(claim.originalIssuer).toBe('original-issuer');

				const property1 = readClaim.properties.get('property-1');
				expect(property1).toBe('property-value');

				const property2 = readClaim.properties.get('property-2');
				expect(property2).toBe('');
			});
		});
	});
});
