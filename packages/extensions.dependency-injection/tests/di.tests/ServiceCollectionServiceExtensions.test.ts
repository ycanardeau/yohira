import { Ctor, Type } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import {
	addScopedCtor,
	addSingletonCtor,
	addSingletonInstance,
	addTransientCtor,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import {
	tryAdd,
	tryAddIterable,
} from '@yohira/extensions.dependency-injection.abstractions/extensions/ServiceCollectionDescriptorExtensions';
import { FakeService } from '@yohira/extensions.dependency-injection.specification.tests/fakes/FakeService';
import { expect, test } from 'vitest';

const instance = new FakeService();

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L43
test('AddWithTypeAddsServiceWithRightLifecycle', () => {
	const AddWithTypeAddsServiceWithRightLifecycle = (
		addTypeAction: (collection: IServiceCollection) => void,
		expectedServiceType: Type,
		expectedImplCtor: Ctor<object>,
		lifeCycle: ServiceLifetime,
	): void => {
		const collection = new ServiceCollection();

		addTypeAction(collection);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.serviceType).toBe(expectedServiceType);
		expect(descriptor.implCtor).toBe(expectedImplCtor);
		expect(descriptor.lifetime).toBe(lifeCycle);
	};

	const serviceType = 'IFakeService';
	const implCtor = FakeService;

	AddWithTypeAddsServiceWithRightLifecycle(
		(collection) => addTransientCtor(collection, serviceType, implCtor),
		serviceType,
		implCtor,
		ServiceLifetime.Transient,
	);

	AddWithTypeAddsServiceWithRightLifecycle(
		(collection) => addScopedCtor(collection, serviceType, implCtor),
		serviceType,
		implCtor,
		ServiceLifetime.Scoped,
	);

	AddWithTypeAddsServiceWithRightLifecycle(
		(collection) => addSingletonCtor(collection, serviceType, implCtor),
		serviceType,
		implCtor,
		ServiceLifetime.Singleton,
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L121
test('AddSingleton_AddsWithSingletonLifecycle', () => {
	const AddSingleton_AddsWithSingletonLifecycle = (
		addAction: (collection: IServiceCollection) => void,
	): void => {
		const collection = new ServiceCollection();

		addAction(collection);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.implInstance).toBe(instance);
		expect(descriptor.lifetime).toBe(ServiceLifetime.Singleton);
	};

	AddSingleton_AddsWithSingletonLifecycle((collection) =>
		addSingletonInstance(collection, 'IFakeService', instance),
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L138
test('TryAddNoOpFailsIfExists', () => {
	const TryAddNoOpFailsIfExists = (
		addAction: (collection: IServiceCollection) => void,
	): void => {
		const collection = new ServiceCollection();
		addAction(collection);
		const d = ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			'IFakeService',
			FakeService,
		);

		tryAdd(collection, d);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.serviceType).toBe('IFakeService');
		expect(descriptor.implInstance).toBe(instance);
		expect(descriptor.lifetime).toBe(ServiceLifetime.Singleton);
	};

	TryAddNoOpFailsIfExists((collection) =>
		addSingletonInstance(collection, 'IFakeService', instance),
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L183
test('TryAdd_WithType_AddsService', () => {
	const TryAdd_WithType_AddsService = (
		addAction: (collection: IServiceCollection) => void,
		expectedServiceType: Type,
		expectedImplCtor: Ctor<object>,
		expectedLifetime: ServiceLifetime,
	): void => {
		const collection = new ServiceCollection();

		addAction(collection);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.serviceType).toBe(expectedServiceType);
		expect(descriptor.implCtor).toBe(expectedImplCtor);
		expect(descriptor.lifetime).toBe(expectedLifetime);
	};

	const serviceType = 'IFakeService';
	const implCtor = FakeService;

	TryAdd_WithType_AddsService(
		(collection) =>
			tryAdd(
				collection,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Transient,
					serviceType,
					implCtor,
				),
			),
		serviceType,
		implCtor,
		ServiceLifetime.Transient,
	);

	TryAdd_WithType_AddsService(
		(collection) =>
			tryAdd(
				collection,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Scoped,
					serviceType,
					implCtor,
				),
			),
		serviceType,
		implCtor,
		ServiceLifetime.Scoped,
	);

	TryAdd_WithType_AddsService(
		(collection) =>
			tryAdd(
				collection,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					serviceType,
					implCtor,
				),
			),
		serviceType,
		implCtor,
		ServiceLifetime.Singleton,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L204
test('TryAdd_WithType_DoesNotAddDuplicate', () => {
	const TryAdd_WithType_DoesNotAddDuplicate = (
		addAction: (collection: IServiceCollection) => void,
		expectedServiceType: Type,
		expectedImplCtor: Ctor<object>,
	): void => {
		const collection = new ServiceCollection();
		collection.add(
			ServiceDescriptor.fromCtor(
				ServiceLifetime.Transient,
				expectedServiceType,
				expectedImplCtor,
			),
		);

		addAction(collection);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.serviceType).toBe(expectedServiceType);
		expect(descriptor.implCtor).toBe(expectedImplCtor /* REVIEW */);
		expect(descriptor.lifetime).toBe(ServiceLifetime.Transient);
	};

	const serviceType = 'IFakeService';
	const implCtor = FakeService;

	TryAdd_WithType_DoesNotAddDuplicate(
		(collection) =>
			tryAdd(
				collection,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Transient,
					serviceType,
					implCtor,
				),
			),
		serviceType,
		implCtor,
	);

	TryAdd_WithType_DoesNotAddDuplicate(
		(collection) =>
			tryAdd(
				collection,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Scoped,
					serviceType,
					implCtor,
				),
			),
		serviceType,
		implCtor,
	);

	TryAdd_WithType_DoesNotAddDuplicate(
		(collection) =>
			tryAdd(
				collection,
				ServiceDescriptor.fromCtor(
					ServiceLifetime.Singleton,
					serviceType,
					implCtor,
				),
			),
		serviceType,
		implCtor,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L231
test('TryAddIfMissingActuallyAdds', () => {
	const collection = new ServiceCollection();
	const d = ServiceDescriptor.fromCtor(
		ServiceLifetime.Transient,
		'IFakeService',
		FakeService,
	);

	tryAdd(collection, d);

	expect(collection.count).toBe(1);
	const descriptor = Array.from(collection)[0];
	expect(descriptor.serviceType).toBe('IFakeService');
	expect(descriptor.implInstance).toBeUndefined();
	expect(descriptor.lifetime).toBe(ServiceLifetime.Transient);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L271
test('TryAddEnumerable_AddsService', () => {
	const TryAddEnumerable_AddsService = (
		descriptor: ServiceDescriptor,
		expectedServiceType: Type,
		expectedImplCtor: Ctor<object>,
		expectedLifetime: ServiceLifetime,
	): void => {
		const collection = new ServiceCollection();

		tryAddIterable(collection, descriptor);

		expect(collection.count).toBe(1);
		const d = Array.from(collection)[0];
		expect(d.serviceType).toBe(expectedServiceType);
		expect(d.implCtor).toBe(expectedImplCtor);
		expect(d.lifetime).toBe(expectedLifetime);
	};

	const serviceType = 'IFakeService';
	const implCtor = FakeService;

	TryAddEnumerable_AddsService(
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			serviceType,
			implCtor,
		),
		serviceType,
		implCtor,
		ServiceLifetime.Transient,
	);

	TryAddEnumerable_AddsService(
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Scoped,
			serviceType,
			implCtor,
		),
		serviceType,
		implCtor,
		ServiceLifetime.Scoped,
	);

	TryAddEnumerable_AddsService(
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			serviceType,
			implCtor,
		),
		serviceType,
		implCtor,
		ServiceLifetime.Singleton,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L293
test('TryAddEnumerable_DoesNotAddDuplicate', () => {
	const TryAddEnumerable_DoesNotAddDuplicate = (
		descriptor: ServiceDescriptor,
		expectedServiceType: Type,
		expectedImplCtor: Ctor<object>,
		expectedLifetime: ServiceLifetime,
	): void => {
		const collection = new ServiceCollection();
		tryAddIterable(collection, descriptor);

		tryAddIterable(collection, descriptor);

		expect(collection.count).toBe(1);
		const d = Array.from(collection)[0];
		expect(d.serviceType).toBe(expectedServiceType);
		expect(d.implCtor).toBe(expectedImplCtor);
		expect(d.lifetime).toBe(expectedLifetime);
	};

	const serviceType = 'IFakeService';
	const implCtor = FakeService;

	TryAddEnumerable_DoesNotAddDuplicate(
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			serviceType,
			implCtor,
		),
		serviceType,
		implCtor,
		ServiceLifetime.Transient,
	);

	TryAddEnumerable_DoesNotAddDuplicate(
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Scoped,
			serviceType,
			implCtor,
		),
		serviceType,
		implCtor,
		ServiceLifetime.Scoped,
	);

	TryAddEnumerable_DoesNotAddDuplicate(
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			serviceType,
			implCtor,
		),
		serviceType,
		implCtor,
		ServiceLifetime.Singleton,
	);
});

// TODO
