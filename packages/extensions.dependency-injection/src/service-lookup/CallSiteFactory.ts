import { Ctor, ICollection, List, tryGetValue } from '@yohira/base';
import {
	IServiceProviderIsService,
	ServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { METADATA_KEY, MetadataReader } from '@yohira/third-party.inversify';
import { Result } from '@yohira/third-party.ts-results';

import { CallSiteChain } from './CallSiteChain';
import { CallSiteResultCacheLocation } from './CallSiteResultCacheLocation';
import { ConstantCallSite } from './ConstantCallSite';
import { CtorCallSite } from './CtorCallSite';
import { FactoryCallSite } from './FactoryCallSite';
import { IterableCallSite } from './IterableCallSite';
import { ResultCache } from './ResultCache';
import { ServiceCacheKey } from './ServiceCacheKey';
import { ServiceCallSite } from './ServiceCallSite';

const genericTypeRegExp = /^([\w]+)<([\w<>]+)>$/;

function isConstructedGenericType(type: symbol): boolean {
	return genericTypeRegExp.test(Symbol.keyFor(type)!);
}

function getGenericTypeDefinition(type: symbol): symbol {
	const match = genericTypeRegExp.exec(Symbol.keyFor(type)!);
	if (!match) {
		throw new Error(
			'This operation is only valid on generic types.' /* LOC */,
		);
	}
	return Symbol.for(`${match[1]}<>`);
}

class ServiceDescriptorCacheItem {
	private item?: ServiceDescriptor;
	private items?: List<ServiceDescriptor>;

	get last(): ServiceDescriptor {
		if (this.items !== undefined && this.items.count > 0) {
			return this.items.get(this.items.count - 1);
		}

		if (this.item === undefined) {
			throw new Error('Assertion failed.');
		}
		return this.item;
	}

	get count(): number {
		if (this.item === undefined) {
			if (this.items !== undefined) {
				throw new Error('Assertion failed.');
			}
			return 0;
		}

		return 1 + (this.items?.count ?? 0);
	}

	get(index: number): ServiceDescriptor {
		if (index >= this.count) {
			throw new Error(
				'Specified argument was out of the range of valid values.' /* LOC */,
			);
		}

		if (index === 0) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return this.item!;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.items!.get(index - 1);
	}

	getSlot(descriptor: ServiceDescriptor): number {
		if (descriptor === this.item) {
			return this.count - 1;
		}

		if (this.items !== undefined) {
			const index = this.items.indexOf(descriptor);
			if (index !== -1) {
				return this.items.count - (index + 1);
			}
		}

		throw new Error(
			"Requested service descriptor doesn't exist." /* LOC */,
		);
	}

	add(descriptor: ServiceDescriptor): ServiceDescriptorCacheItem {
		const newCacheItem = new ServiceDescriptorCacheItem();
		if (this.item === undefined) {
			if (this.items !== undefined) {
				throw new Error(
					'Specified argument was out of the range of valid values.' /* LOC */,
				);
			}
			newCacheItem.item = descriptor;
		} else {
			newCacheItem.item = this.item;
			newCacheItem.items = this.items ?? new List();
			newCacheItem.items.add(descriptor);
		}
		return newCacheItem;
	}
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteFactory.cs,b3200cd3834458b8,references
export class CallSiteFactory implements IServiceProviderIsService {
	private static readonly defaultSlot = 0;
	private readonly descriptors: ServiceDescriptor[];
	private readonly callSiteCache = new Map<number, ServiceCallSite>();
	private readonly descriptorLookup = new Map<
		symbol,
		ServiceDescriptorCacheItem
	>();
	// REVIEW: callSiteLocks

	private populate(): void {
		for (const descriptor of this.descriptors) {
			const serviceType = descriptor.serviceType;
			// TODO

			const cacheKey = serviceType;
			const tryGetValueResult = tryGetValue(
				this.descriptorLookup,
				cacheKey,
			);
			this.descriptorLookup.set(
				cacheKey,
				(tryGetValueResult.val ?? new ServiceDescriptorCacheItem()).add(
					descriptor,
				),
			);
		}
	}

	constructor(descriptors: ICollection<ServiceDescriptor>) {
		// TODO
		this.descriptors = Array.from(descriptors);

		this.populate();
	}

	add(type: symbol, serviceCallSite: ServiceCallSite): void {
		this.callSiteCache.set(
			new ServiceCacheKey(
				type,
				CallSiteFactory.defaultSlot,
			).getHashCode(),
			serviceCallSite,
		);
	}

	private tryCreateExactCore(
		descriptor: ServiceDescriptor,
		serviceType: symbol,
		callSiteChain: CallSiteChain,
		slot: number,
	): ServiceCallSite | undefined {
		if (serviceType === descriptor.serviceType) {
			const callSiteKey = new ServiceCacheKey(serviceType, slot);
			const callSiteKeyHashCode = callSiteKey.getHashCode();
			const tryGetValueResult = tryGetValue(
				this.callSiteCache,
				callSiteKeyHashCode,
			);
			if (tryGetValueResult.ok) {
				return tryGetValueResult.val;
			}

			let callSite: ServiceCallSite;
			const lifetime = ResultCache.create(
				descriptor.lifetime,
				serviceType,
				slot,
			);
			if (descriptor.implInstance !== undefined) {
				callSite = new ConstantCallSite(
					descriptor.serviceType,
					descriptor.implInstance,
				);
			} else if (descriptor.implFactory !== undefined) {
				callSite = new FactoryCallSite(
					lifetime,
					descriptor.serviceType,
					descriptor.implFactory,
				);
			} else if (descriptor.implCtor !== undefined) {
				callSite = this.createCtorCallSite(
					lifetime,
					descriptor.serviceType,
					descriptor.implCtor,
					callSiteChain,
				);
			} else {
				throw new Error('Invalid service descriptor' /* LOC */);
			}

			this.callSiteCache.set(callSiteKeyHashCode, callSite);
			return callSite;
		}

		return undefined;
	}

	private tryCreateExact(
		serviceType: symbol,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined {
		const tryGetValueResult = tryGetValue(
			this.descriptorLookup,
			serviceType,
		);
		if (tryGetValueResult.ok) {
			return this.tryCreateExactCore(
				tryGetValueResult.val.last,
				serviceType,
				callSiteChain,
				CallSiteFactory.defaultSlot,
			);
		}

		return undefined;
	}

	private createArgumentCallSites(
		implCtor: Ctor,
		callSiteChain: CallSiteChain,
		parameterTypes: symbol[],
		throwIfCallSiteNotFound: boolean,
	): ServiceCallSite[] | undefined {
		const parameterCallSites: ServiceCallSite[] = [];
		for (const parameterType of parameterTypes) {
			const callSite = this.getCallSite(parameterType, callSiteChain);

			if (callSite === undefined) {
				// TODO
			}

			if (callSite === undefined) {
				if (throwIfCallSiteNotFound) {
					throw new Error(
						`Unable to resolve service for type '${Symbol.keyFor(
							parameterType,
						)}' while attempting to activate '${
							implCtor.name
						}'.` /* LOC */,
					);
				}

				return undefined;
			}

			parameterCallSites.push(callSite);
		}

		return parameterCallSites;
	}

	private createCtorCallSite(
		lifetime: ResultCache,
		serviceType: symbol,
		implCtor: Ctor<object>,
		callSiteChain: CallSiteChain,
	): ServiceCallSite {
		try {
			callSiteChain.add(serviceType, implCtor);
			const metadataReader = new MetadataReader();
			const metadata = metadataReader.getConstructorMetadata(implCtor);
			const { userGeneratedMetadata: ctorArgsMetadata } = metadata;
			const match = genericTypeRegExp.exec(Symbol.keyFor(serviceType)!);
			const parameterTypes = Object.values(ctorArgsMetadata).map(
				(metadata) => {
					const parameterType = metadata.find(
						({ key }) => key === METADATA_KEY.INJECT_TAG,
					)?.value as symbol;
					return match
						? Symbol.for(
								Symbol.keyFor(parameterType)!.replace(
									'<>',
									`<${match[2]}>`,
								),
						  )
						: parameterType;
				},
			);
			// TODO: Remove.
			if (parameterTypes.length !== implCtor.length) {
				throw new Error(/* TODO: message */);
			}
			if (parameterTypes.length === 0) {
				return new CtorCallSite(lifetime, serviceType, implCtor);
			}

			// TODO
			const parameterCallSites = this.createArgumentCallSites(
				implCtor,
				callSiteChain,
				parameterTypes,
				true,
			);

			return new CtorCallSite(
				lifetime,
				serviceType,
				implCtor,
				parameterCallSites,
			);
		} finally {
			callSiteChain.remove(serviceType);
		}
	}

	private tryCreateOpenGenericCore(
		descriptor: ServiceDescriptor,
		serviceType: symbol,
		callSiteChain: CallSiteChain,
		slot: number,
		throwOnConstraintViolation: boolean,
	): ServiceCallSite | undefined {
		const match = genericTypeRegExp.exec(Symbol.keyFor(serviceType)!);
		if (match && Symbol.for(`${match[1]}<>`) === descriptor.serviceType) {
			const callSiteKey = new ServiceCacheKey(serviceType, slot);
			const callSiteKeyHashCode = callSiteKey.getHashCode();
			const tryGetValueResult = tryGetValue(
				this.callSiteCache,
				callSiteKeyHashCode,
			);
			if (tryGetValueResult.ok) {
				return tryGetValueResult.val;
			}

			if (descriptor.implCtor === undefined) {
				throw new Error('Assertion failed.');
			}
			const lifetime = ResultCache.create(
				descriptor.lifetime,
				serviceType,
				slot,
			);
			// TODO

			const callSite = this.createCtorCallSite(
				lifetime,
				serviceType,
				descriptor.implCtor /* TODO: closedType */,
				callSiteChain,
			);
			this.callSiteCache.set(callSiteKeyHashCode, callSite);
			return callSite;
		}

		return undefined;
	}

	private tryCreateOpenGeneric(
		serviceType: symbol,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined {
		if (isConstructedGenericType(serviceType)) {
			const tryGetValueResult = tryGetValue(
				this.descriptorLookup,
				getGenericTypeDefinition(serviceType),
			);
			if (tryGetValueResult.ok) {
				return this.tryCreateOpenGenericCore(
					tryGetValueResult.val.last,
					serviceType,
					callSiteChain,
					CallSiteFactory.defaultSlot,
					true,
				);
			}
		}

		return undefined;
	}

	private static getCommonCacheLocation(
		locationA: CallSiteResultCacheLocation,
		locationB: CallSiteResultCacheLocation,
	): CallSiteResultCacheLocation {
		return Math.max(locationA, locationB);
	}

	private tryCreateIterable(
		serviceType: symbol,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined {
		const callSiteKey = new ServiceCacheKey(
			serviceType,
			CallSiteFactory.defaultSlot,
		);
		const callSiteKeyHashCode = callSiteKey.getHashCode();
		const tryGetValueResult = tryGetValue(
			this.callSiteCache,
			callSiteKeyHashCode,
		);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val;
		}

		try {
			callSiteChain.add(serviceType, undefined);

			const match = genericTypeRegExp.exec(Symbol.keyFor(serviceType)!);
			if (match && `${match[1]}<>` === 'Iterable<>') {
				const itemType = Symbol.for(match[2]);
				let cacheLocation = CallSiteResultCacheLocation.Root;

				const callSites: ServiceCallSite[] = [];

				// If item type is not generic we can safely use descriptor cache
				let tryGetValueResult: Result<
					ServiceDescriptorCacheItem,
					undefined
				>;
				if (
					!isConstructedGenericType(itemType) &&
					(tryGetValueResult = tryGetValue(
						this.descriptorLookup,
						itemType,
					)) &&
					tryGetValueResult.ok
				) {
					const { val: descriptors } = tryGetValueResult;
					for (let i = 0; i < descriptors.count; i++) {
						const descriptor = descriptors.get(i);

						// Last service should get slot 0
						const slot = descriptors.count - i - 1;
						// There may not be any open generics here
						const callSite = this.tryCreateExactCore(
							descriptor,
							itemType,
							callSiteChain,
							slot,
						);
						if (callSite === undefined) {
							throw new Error('Assertion failed.');
						}

						cacheLocation = CallSiteFactory.getCommonCacheLocation(
							cacheLocation,
							callSite.cache.location,
						);
						callSites.push(callSite);
					}
				} else {
					let slot = 0;
					// We are going in reverse so the last service in descriptor list gets slot 0
					for (let i = this.descriptors.length - 1; i >= 0; i--) {
						const descriptor = this.descriptors[i];
						const callSite =
							this.tryCreateExactCore(
								descriptor,
								itemType,
								callSiteChain,
								slot,
							) ??
							this.tryCreateOpenGenericCore(
								descriptor,
								itemType,
								callSiteChain,
								slot,
								false,
							);

						if (callSite !== undefined) {
							slot++;

							cacheLocation =
								CallSiteFactory.getCommonCacheLocation(
									cacheLocation,
									callSite.cache.location,
								);
							callSites.push(callSite);
						}
					}

					callSites.reverse();
				}

				let resultCache = ResultCache.none;
				if (
					cacheLocation === CallSiteResultCacheLocation.Scope ||
					cacheLocation === CallSiteResultCacheLocation.Root
				) {
					resultCache = new ResultCache(cacheLocation, callSiteKey);
				}

				const callSite = new IterableCallSite(
					resultCache,
					itemType,
					callSites,
				);
				this.callSiteCache.set(callSiteKeyHashCode, callSite);
				return callSite;
			}

			return undefined;
		} finally {
			callSiteChain.remove(serviceType);
		}
	}

	private createCallSite(
		serviceType: symbol,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined {
		// REVIEW

		// REVIEW: Lock.
		callSiteChain.checkCircularDependency(serviceType);

		const callSite =
			this.tryCreateExact(serviceType, callSiteChain) ??
			this.tryCreateOpenGeneric(serviceType, callSiteChain) ??
			this.tryCreateIterable(serviceType, callSiteChain);

		return callSite;
	}

	getCallSite(
		serviceType: symbol,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined {
		const tryGetValueResult = tryGetValue(
			this.callSiteCache,
			new ServiceCacheKey(
				serviceType,
				CallSiteFactory.defaultSlot,
			).getHashCode(),
		);
		return tryGetValueResult.ok
			? tryGetValueResult.val
			: this.createCallSite(serviceType, callSiteChain);
	}

	isService(serviceType: symbol): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}
}
