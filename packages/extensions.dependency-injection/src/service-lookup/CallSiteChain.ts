import { Ctor, Type } from '@yohira/base/Type';

class ChainItemInfo {
	constructor(readonly order: number, readonly implCtor: Ctor | undefined) {}
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteChain.cs,ae1fab1640004f66,references
export class CallSiteChain {
	private readonly callSiteChain: Map<
		string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
		ChainItemInfo
	>;

	constructor() {
		this.callSiteChain = new Map<
			string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
			ChainItemInfo
		>();
	}

	private createCircularDependencyErrorMessage(type: Type): string {
		// TODO
		return `A circular dependency was detected for the service of type '${type}'.`; /* LOC */
	}

	checkCircularDependency(serviceType: Type): void {
		if (this.callSiteChain.has(serviceType.value)) {
			throw new Error(
				this.createCircularDependencyErrorMessage(serviceType),
			);
		}
	}

	remove(serviceType: Type): void {
		this.callSiteChain.delete(serviceType.value);
	}

	add(serviceType: Type, implCtor: Ctor | undefined): void {
		this.callSiteChain.set(
			serviceType.value,
			new ChainItemInfo(this.callSiteChain.size, implCtor),
		);
	}
}
