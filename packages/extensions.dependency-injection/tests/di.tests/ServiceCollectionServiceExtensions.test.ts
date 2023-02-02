import { Ctor } from '@yohira/base';
import {
	IServiceCollection,
	ServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addScopedCtor,
	addSingletonCtor,
	addSingletonInstance,
	addTransientCtor,
	tryAddServiceDescriptor,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';
import { FakeService } from '@yohira/extensions.dependency-injection.specification.tests';
import { expect, test } from 'vitest';

const instance = new FakeService();

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L43
test('AddWithTypeAddsServiceWithRightLifecycle', () => {
	function AddWithTypeAddsServiceWithRightLifecycle(
		addTypeAction: (collection: IServiceCollection) => void,
		expectedServiceType: symbol,
		expectedImplCtor: Ctor<object>,
		lifeCycle: ServiceLifetime,
	): void {
		const collection = new ServiceCollection();

		addTypeAction(collection);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.serviceType === expectedServiceType).toBe(true);
		expect(descriptor.implCtor).toBe(expectedImplCtor);
		expect(descriptor.lifetime).toBe(lifeCycle);
	}

	const serviceType = Symbol.for('IFakeService');
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
	function AddSingleton_AddsWithSingletonLifecycle(
		addAction: (collection: IServiceCollection) => void,
	): void {
		const collection = new ServiceCollection();

		addAction(collection);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.implInstance).toBe(instance);
		expect(descriptor.lifetime).toBe(ServiceLifetime.Singleton);
	}

	AddSingleton_AddsWithSingletonLifecycle((collection) =>
		addSingletonInstance(collection, Symbol.for('IFakeService'), instance),
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L138
test('TryAddNoOpFailsIfExists', () => {
	function TryAddNoOpFailsIfExists(
		addAction: (collection: IServiceCollection) => void,
	): void {
		const collection = new ServiceCollection();
		addAction(collection);
		const d = ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			Symbol.for('IFakeService'),
			FakeService,
		);

		tryAddServiceDescriptor(collection, d);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.serviceType === Symbol.for('IFakeService')).toBe(
			true,
		);
		expect(descriptor.implInstance).toBe(instance);
		expect(descriptor.lifetime).toBe(ServiceLifetime.Singleton);
	}

	TryAddNoOpFailsIfExists((collection) =>
		addSingletonInstance(collection, Symbol.for('IFakeService'), instance),
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L183
test('TryAdd_WithType_AddsService', () => {
	function TryAdd_WithType_AddsService(
		addAction: (collection: IServiceCollection) => void,
		expectedServiceType: symbol,
		expectedImplCtor: Ctor<object>,
		expectedLifetime: ServiceLifetime,
	): void {
		const collection = new ServiceCollection();

		addAction(collection);

		expect(collection.count).toBe(1);
		const descriptor = Array.from(collection)[0];
		expect(descriptor.serviceType === expectedServiceType).toBe(true);
		expect(descriptor.implCtor).toBe(expectedImplCtor);
		expect(descriptor.lifetime).toBe(expectedLifetime);
	}

	const serviceType = Symbol.for('IFakeService');
	const implCtor = FakeService;

	TryAdd_WithType_AddsService(
		(collection) =>
			tryAddServiceDescriptor(
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
			tryAddServiceDescriptor(
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
			tryAddServiceDescriptor(
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
	function TryAdd_WithType_DoesNotAddDuplicate(
		addAction: (collection: IServiceCollection) => void,
		expectedServiceType: symbol,
		expectedImplCtor: Ctor<object>,
	): void {
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
		expect(descriptor.serviceType === expectedServiceType).toBe(true);
		expect(descriptor.implCtor).toBe(expectedImplCtor /* REVIEW */);
		expect(descriptor.lifetime).toBe(ServiceLifetime.Transient);
	}

	const serviceType = Symbol.for('IFakeService');
	const implCtor = FakeService;

	TryAdd_WithType_DoesNotAddDuplicate(
		(collection) =>
			tryAddServiceDescriptor(
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
			tryAddServiceDescriptor(
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
			tryAddServiceDescriptor(
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
		Symbol.for('IFakeService'),
		FakeService,
	);

	tryAddServiceDescriptor(collection, d);

	expect(collection.count).toBe(1);
	const descriptor = Array.from(collection)[0];
	expect(descriptor.serviceType === Symbol.for('IFakeService')).toBe(true);
	expect(descriptor.implInstance).toBeUndefined();
	expect(descriptor.lifetime).toBe(ServiceLifetime.Transient);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceCollectionServiceExtensionsTest.cs#L271
test('TryAddEnumerable_AddsService', () => {
	function TryAddEnumerable_AddsService(
		descriptor: ServiceDescriptor,
		expectedServiceType: symbol,
		expectedImplCtor: Ctor<object>,
		expectedLifetime: ServiceLifetime,
	): void {
		const collection = new ServiceCollection();

		tryAddServiceDescriptorIterable(collection, descriptor);

		expect(collection.count).toBe(1);
		const d = Array.from(collection)[0];
		expect(d.serviceType === expectedServiceType).toBe(true);
		expect(d.implCtor).toBe(expectedImplCtor);
		expect(d.lifetime).toBe(expectedLifetime);
	}

	const serviceType = Symbol.for('IFakeService');
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
	function TryAddEnumerable_DoesNotAddDuplicate(
		descriptor: ServiceDescriptor,
		expectedServiceType: symbol,
		expectedImplCtor: Ctor<object>,
		expectedLifetime: ServiceLifetime,
	): void {
		const collection = new ServiceCollection();
		tryAddServiceDescriptorIterable(collection, descriptor);

		tryAddServiceDescriptorIterable(collection, descriptor);

		expect(collection.count).toBe(1);
		const d = Array.from(collection)[0];
		expect(d.serviceType === expectedServiceType).toBe(true);
		expect(d.implCtor).toBe(expectedImplCtor);
		expect(d.lifetime).toBe(expectedLifetime);
	}

	const serviceType = Symbol.for('IFakeService');
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
