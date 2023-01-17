import { Type } from '@yohira/base';
import {
	ServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
} from '@yohira/extensions.dependency-injection.abstractions';
import { FakeService } from '@yohira/extensions.dependency-injection.specification.tests';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/279fb0436f475fbc35ffeff68330f970ee77831a/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionTests.cs#L14
test('makeReadonly', () => {
	const expectedMessage =
		'The service collection cannot be modified because it is read-only.';

	const serviceCollection = new ServiceCollection();
	const descriptor = ServiceDescriptor.fromInstance(
		ServiceLifetime.Singleton,
		Type.from('IFakeService'),
		new FakeService(),
	);
	serviceCollection.add(descriptor);

	serviceCollection.makeReadonly();

	const descriptor2 = ServiceDescriptor.fromInstance(
		ServiceLifetime.Singleton,
		Type.from('IFakeEveryService'),
		new FakeService(),
	);

	expect(() => {
		serviceCollection.set(0, descriptor2);
	}).toThrowError(expectedMessage);
	expect(() => serviceCollection.clear()).toThrowError(expectedMessage);
	expect(() => serviceCollection.remove(descriptor)).toThrowError(
		expectedMessage,
	);
	expect(() => serviceCollection.add(descriptor2)).toThrowError(
		expectedMessage,
	);
	expect(() => serviceCollection.insert(0, descriptor2)).toThrowError(
		expectedMessage,
	);
	expect(() => serviceCollection.removeAt(0)).toThrowError(expectedMessage);

	expect(serviceCollection.isReadonly).toBe(true);
	expect(serviceCollection.count).toBe(1);
	for (const d of serviceCollection) {
		expect(d).toBe(descriptor);
	}
	expect(serviceCollection.get(0)).toBe(descriptor);
	expect(serviceCollection.contains(descriptor)).toBe(true);
	expect(serviceCollection.indexOf(descriptor)).toBe(0);

	// TODO: copyTo

	// ensure MakeReadOnly can be called twice, and it is just ignored
	serviceCollection.makeReadonly();
	expect(serviceCollection.isReadonly).toBe(true);
});
