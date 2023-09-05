import { IDataSerializer, SecureDataFormat } from '@yohira/authentication';
import { IServiceProvider } from '@yohira/base';
import { addDataProtection } from '@yohira/data-protection';
import { IDataProtectionProvider } from '@yohira/data-protection.abstractions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	getRequiredService,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILoggerFactory,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { beforeEach, expect, test } from 'vitest';

class StringSerializer implements IDataSerializer<string> {
	serialize(model: string): Buffer {
		return Buffer.from(model, 'utf8');
	}

	deserialize(data: Buffer): string | undefined {
		return data.toString('utf8');
	}
}

let serviceProvider: IServiceProvider;

beforeEach(() => {
	const serviceCollection = new ServiceCollection();
	tryAddServiceDescriptor(
		serviceCollection,
		ServiceDescriptor.fromInstance(
			ServiceLifetime.Singleton,
			ILoggerFactory,
			NullLoggerFactory.instance,
		),
	) /* HACK */;
	addDataProtection(serviceCollection);
	serviceProvider = buildServiceProvider(serviceCollection);
});

// https://github.com/dotnet/aspnetcore/blob/00d0038f937f0059a847fde504649fe33ec935e0/src/Security/Authentication/test/SecureDataFormatTests.cs#L22
test('ProtectDataRoundTrips', () => {
	const provider = getRequiredService<IDataProtectionProvider>(
		serviceProvider,
		IDataProtectionProvider,
	);
	const protector = provider.createProtector('test');
	const secureDataFormat = new SecureDataFormat<string>(
		new StringSerializer(),
		protector,
	);

	const input = 'abcdefghijklmnopqrstuvwxyz0123456789';
	const protectedData = secureDataFormat.protect(input);
	const result = secureDataFormat.unprotect(protectedData);
	expect(result).toBe(input);
});

// https://github.com/dotnet/aspnetcore/blob/00d0038f937f0059a847fde504649fe33ec935e0/src/Security/Authentication/test/SecureDataFormatTests.cs#L35
test('ProtectWithPurposeRoundTrips', () => {
	const provider = getRequiredService<IDataProtectionProvider>(
		serviceProvider,
		IDataProtectionProvider,
	);
	const protector = provider.createProtector('test');
	const secureDataFormat = new SecureDataFormat<string>(
		new StringSerializer(),
		protector,
	);

	const input = 'abcdefghijklmnopqrstuvwxyz0123456789';
	const purpose = 'purpose1';
	const protectedData = secureDataFormat.protect(input, purpose);
	const result = secureDataFormat.unprotect(protectedData, purpose);
	expect(result).toBe(input);
});

// https://github.com/dotnet/aspnetcore/blob/00d0038f937f0059a847fde504649fe33ec935e0/src/Security/Authentication/test/SecureDataFormatTests.cs#L49
test('UnprotectWithDifferentPurposeFails', () => {
	const provider = getRequiredService<IDataProtectionProvider>(
		serviceProvider,
		IDataProtectionProvider,
	);
	const protector = provider.createProtector('test');
	const secureDataFormat = new SecureDataFormat<string>(
		new StringSerializer(),
		protector,
	);

	const input = 'abcdefghijklmnopqrstuvwxyz0123456789';
	const purpose = 'purpose1';
	const protectedData = secureDataFormat.protect(input, purpose);
	let result = secureDataFormat.unprotect(protectedData); // Undefined other purpose
	expect(result).toBeUndefined();

	result = secureDataFormat.unprotect(protectedData, 'purpose2');
	expect(result).toBeUndefined();
});
