import { ICollection } from '@yohira/base/ICollection';
import { IDisposable } from '@yohira/base/IDisposable';
import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { Type } from '@yohira/base/Type';
import { IServiceScope } from '@yohira/extensions.dependency-injection.abstractions/IServiceScope';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceProviderOptions } from '@yohira/extensions.dependency-injection/ServiceProviderOptions';
import { CallSiteChain } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteChain';
import { CallSiteFactory } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteFactory';
import { CallSiteValidator } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteValidator';
import { RuntimeServiceProviderEngine } from '@yohira/extensions.dependency-injection/service-lookup/RuntimeServiceProviderEngine';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';
import { ServiceProviderEngine } from '@yohira/extensions.dependency-injection/service-lookup/ServiceProviderEngine';
import { ServiceProviderEngineScope } from '@yohira/extensions.dependency-injection/service-lookup/ServiceProviderEngineScope';

const getOrAdd = <K, V>(
	map: Map<K, V>,
	key: K,
	valueFactory: (key: K) => V,
): V => {
	if (map.has(key)) {
		return map.get(key) as V;
	} else {
		const value = valueFactory(key);
		map.set(key, value);
		return value;
	}
};

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceProvider.cs,7b97f84895159f6d,references
export class ServiceProvider implements IServiceProvider, IDisposable {
	private readonly callSiteValidator?: CallSiteValidator;

	// Internal for testing
	/** @internal */ engine: ServiceProviderEngine;

	private readonly _createServiceAccessor: (
		serviceType: Type,
	) => (
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined;

	private disposed = false;

	private realizedServices: Map<
		Type,
		(
			serviceProviderEngineScope: ServiceProviderEngineScope,
		) => object | undefined
	>;

	readonly callSiteFactory: CallSiteFactory;

	root: ServiceProviderEngineScope;

	private getEngine = (): ServiceProviderEngine => {
		return RuntimeServiceProviderEngine.instance; /* TODO */
	};

	private onCreate = (callSite: ServiceCallSite): void => {
		// TODO
		throw new Error('Method not implemented.');
	};

	private createServiceAccessor = (
		serviceType: Type,
	): ((
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined) => {
		const callSite = this.callSiteFactory.getCallSite(
			serviceType,
			new CallSiteChain(),
		);
		if (callSite !== undefined) {
			// TODO: Log.
			this.onCreate(callSite);

			// TODO: Optimize singleton case

			return this.engine.realizeService(callSite);
		}

		return () => undefined;
	};

	constructor(
		serviceDescriptors: ICollection<ServiceDescriptor>,
		options: ServiceProviderOptions,
	) {
		this.root = new ServiceProviderEngineScope(this, true);
		this.engine = this.getEngine();
		this._createServiceAccessor = this.createServiceAccessor;
		this.realizedServices = new Map<
			string,
			(
				serviceProviderEngineScope: ServiceProviderEngineScope,
			) => object | undefined
		>();

		this.callSiteFactory = new CallSiteFactory(serviceDescriptors);
		// TODO

		// TODO

		// TODO: Log.
	}

	private onResolve = (serviceType: Type, scope: IServiceScope): void => {
		this.callSiteValidator?.validateResolution(
			serviceType,
			scope,
			this.root,
		);
	};

	getService = <T>(
		serviceType: string,
		serviceProviderEngineScope = this.root,
	): T | undefined => {
		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}

		const realizedService = getOrAdd(
			this.realizedServices,
			serviceType,
			this._createServiceAccessor,
		);
		this.onResolve(serviceType, serviceProviderEngineScope);
		// TODO: Log.
		const result = realizedService(serviceProviderEngineScope);
		// TODO: Assert.
		return result as T | undefined;
	};

	dispose = (): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
