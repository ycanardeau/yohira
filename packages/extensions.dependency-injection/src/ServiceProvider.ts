import {
	AggregateError,
	IAsyncDisposable,
	ICollection,
	IDisposable,
	IServiceProvider,
	getOrAdd,
} from '@yohira/base';
import {
	IServiceScope,
	IServiceScopeFactory,
	ServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';

import { ServiceProviderOptions } from './ServiceProviderOptions';
import { CallSiteChain } from './service-lookup/CallSiteChain';
import { CallSiteFactory } from './service-lookup/CallSiteFactory';
import { CallSiteValidator } from './service-lookup/CallSiteValidator';
import { ConstantCallSite } from './service-lookup/ConstantCallSite';
import { RuntimeServiceProviderEngine } from './service-lookup/RuntimeServiceProviderEngine';
import { ServiceCallSite } from './service-lookup/ServiceCallSite';
import { ServiceProviderCallSite } from './service-lookup/ServiceProviderCallSite';
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
		serviceType: symbol,
	) => (
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined;

	private disposed = false;

	/** @internal */ isDisposed(): boolean {
		return this.disposed;
	}

	private realizedServices: Map<
		symbol,
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
		serviceType: symbol,
	): ((
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined) => {
		const callSite = this.callSiteFactory.getCallSiteByType(
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

	private validateService(descriptor: ServiceDescriptor): void {
		if (false /* TODO */) {
			return;
		}

		try {
			const callSite =
				this.callSiteFactory.getCallSiteByServiceDescriptor(
					descriptor,
					new CallSiteChain(),
				);
			if (callSite !== undefined) {
				this.onCreate(callSite);
			}
		} catch (error) {
			throw new Error(
				`Error while validating the service descriptor '${descriptor}': ${error}`,
			);
		}
	}

	constructor(
		serviceDescriptors: ICollection<ServiceDescriptor>,
		options: ServiceProviderOptions,
	) {
		this.root = new ServiceProviderEngineScope(this, true);
		this.engine = this.getEngine();
		this._createServiceAccessor = this.createServiceAccessor;
		this.realizedServices = new Map<
			symbol,
			(
				serviceProviderEngineScope: ServiceProviderEngineScope,
			) => object | undefined
		>();

		this.callSiteFactory = new CallSiteFactory(serviceDescriptors);
		this.callSiteFactory.add(
			IServiceProvider,
			new ServiceProviderCallSite(),
		);
		this.callSiteFactory.add(
			IServiceScopeFactory,
			new ConstantCallSite(IServiceScopeFactory, this.root),
		);
		// TODO

		if (options.validateScopes) {
			this.callSiteValidator = new CallSiteValidator();
		}

		if (options.validateOnBuild) {
			let errors: unknown[] | undefined = undefined;
			for (const serviceDescriptor of serviceDescriptors) {
				try {
					this.validateService(serviceDescriptor);
				} catch (error) {
					errors ??= [];
					errors.push(error);
				}
			}

			if (errors !== undefined) {
				throw new AggregateError(
					errors,
					'Some services are not able to be constructed',
				);
			}
		}

		// TODO: Log.
	}

	private onResolve(serviceType: symbol, scope: IServiceScope): void {
		this.callSiteValidator?.validateResolution(
			serviceType,
			scope,
			this.root,
		);
	}

	getService<T>(
		serviceType: symbol,
		serviceProviderEngineScope = this.root,
	): T | undefined {
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
	}

	private disposeCore(): void {
		this.disposed = true;
		// TODO
	}

	dispose(): void {
		this.disposeCore();
		this.root.dispose();
	}

	disposeAsync(): Promise<void> {
		this.disposeCore();
		return this.root.disposeAsync();
	}

	/** @internal */ createScope(): IServiceScope {
		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}

		return new ServiceProviderEngineScope(this, false);
	}
}
