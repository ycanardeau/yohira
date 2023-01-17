import {
	IAsyncDisposable,
	ICollection,
	IDisposable,
	IServiceProvider,
	Type,
	getOrAdd,
} from '@yohira/base';
import {
	IServiceScope,
	ServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';

import { ServiceProviderOptions } from './ServiceProviderOptions';
import { CallSiteChain } from './service-lookup/CallSiteChain';
import { CallSiteFactory } from './service-lookup/CallSiteFactory';
import { CallSiteValidator } from './service-lookup/CallSiteValidator';
import { RuntimeServiceProviderEngine } from './service-lookup/RuntimeServiceProviderEngine';
import { ServiceCallSite } from './service-lookup/ServiceCallSite';
import { ServiceProviderEngine } from './service-lookup/ServiceProviderEngine';
import { ServiceProviderEngineScope } from './service-lookup/ServiceProviderEngineScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceProvider.cs,7b97f84895159f6d,references
export class ServiceProvider
	implements IServiceProvider, IDisposable, IAsyncDisposable
{
	private readonly callSiteValidator?: CallSiteValidator;

	// Internal for testing
	/** @internal */ engine: ServiceProviderEngine;

	private readonly _createServiceAccessor: (
		serviceType: string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
	) => (
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined;

	private disposed = false;

	private realizedServices: Map<
		string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
		(
			serviceProviderEngineScope: ServiceProviderEngineScope,
		) => object | undefined
	>;

	readonly callSiteFactory: CallSiteFactory;

	root: ServiceProviderEngineScope;

	private getEngine(): ServiceProviderEngine {
		return RuntimeServiceProviderEngine.instance; /* TODO */
	}

	private onCreate(callSite: ServiceCallSite): void {
		this.callSiteValidator?.validateCallSite(callSite);
	}

	private createServiceAccessor = (
		serviceType: string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
	): ((
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined) => {
		const callSite = this.callSiteFactory.getCallSite(
			Type.from(serviceType),
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
			string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
			(
				serviceProviderEngineScope: ServiceProviderEngineScope,
			) => object | undefined
		>();

		this.callSiteFactory = new CallSiteFactory(serviceDescriptors);
		// TODO

		if (options.validateScopes) {
			this.callSiteValidator = new CallSiteValidator();
		}

		// TODO

		// TODO: Log.
	}

	private onResolve(serviceType: Type, scope: IServiceScope): void {
		this.callSiteValidator?.validateResolution(
			serviceType,
			scope,
			this.root,
		);
	}

	getService<T>(
		serviceType: Type,
		serviceProviderEngineScope = this.root,
	): T | undefined {
		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}

		const realizedService = getOrAdd(
			this.realizedServices,
			serviceType.value,
			this._createServiceAccessor,
		);
		this.onResolve(serviceType, serviceProviderEngineScope);
		// TODO: Log.
		const result = realizedService(serviceProviderEngineScope);
		// TODO: Assert.
		return result as T | undefined;
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	disposeAsync(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
