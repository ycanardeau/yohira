import { Ctor, Type } from '@yohira/base/Type';

class ChainItemInfo {
	constructor(
		readonly order: number,
		readonly implCtor: Ctor<unknown>,
		readonly genericType: Type | undefined,
	) {}
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteChain.cs,ae1fab1640004f66,references
export class CallSiteChain {
	private readonly callSiteChain: Map<Type, ChainItemInfo>;

	constructor() {
		this.callSiteChain = new Map<Type, ChainItemInfo>();
	}

	private createCircularDependencyErrorMessage = (type: Type): string => {
		// TODO
		return `A circular dependency was detected for the service of type '${type}'.`; /* LOC */
	};

	checkCircularDependency = (serviceType: Type): void => {
		if (this.callSiteChain.has(serviceType)) {
			throw new Error(
				this.createCircularDependencyErrorMessage(serviceType),
			);
		}
	};

	remove = (serviceType: Type): void => {
		this.callSiteChain.delete(serviceType);
	};

	add = (
		serviceType: Type,
		implCtor: Ctor<unknown>,
		genericType: Type | undefined,
	): void => {
		this.callSiteChain.set(
			serviceType,
			new ChainItemInfo(this.callSiteChain.size, implCtor, genericType),
		);
	};
}
