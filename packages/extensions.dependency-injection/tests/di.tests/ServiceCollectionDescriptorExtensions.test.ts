import { Type } from '@yohira/base';
import {
	ServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	FakeService,
	TransientFactoryService,
} from '@yohira/extensions.dependency-injection.specification.tests';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionDescriptorExtensionsTests.cs#L15
test('Add_AddsDescriptorToServiceDescriptors', () => {
	const serviceCollection = new ServiceCollection();
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Singleton,
		Type.from('IFakeService'),
		FakeService,
	);

	serviceCollection.add(descriptor);

	expect(serviceCollection.count).toBe(1);
	const result = Array.from(serviceCollection)[0];
	expect(result).toBe(descriptor);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionDescriptorExtensionsTests.cs#L30
test('Add_AddsMultipleDescriptorToServiceDescriptors', () => {
	const serviceCollection = new ServiceCollection();
	const descriptor1 = ServiceDescriptor.fromCtor(
		ServiceLifetime.Singleton,
		Type.from('IFakeService'),
		FakeService,
	);
	const descriptor2 = ServiceDescriptor.fromCtor(
		ServiceLifetime.Transient,
		Type.from('IFactoryService'),
		TransientFactoryService,
	);

	serviceCollection.add(descriptor1);
	serviceCollection.add(descriptor2);

	expect(serviceCollection.count).toBe(2);
	expect(Array.from(serviceCollection)).toEqual([descriptor1, descriptor2]);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionDescriptorExtensionsTests.cs#L47
test('ServiceDescriptors_AllowsRemovingPreviousRegisteredServices', () => {
	const serviceCollection = new ServiceCollection();
	const descriptor1 = ServiceDescriptor.fromCtor(
		ServiceLifetime.Singleton,
		Type.from('IFakeService'),
		FakeService,
	);
	const descriptor2 = ServiceDescriptor.fromCtor(
		ServiceLifetime.Transient,
		Type.from('IFactoryService'),
		TransientFactoryService,
	);

	serviceCollection.add(descriptor1);
	serviceCollection.add(descriptor2);
	serviceCollection.remove(descriptor1);

	expect(serviceCollection.count).toBe(1);
	const result = Array.from(serviceCollection)[0];
	expect(result).toBe(descriptor2);
});

// TODO
