import { Ctor } from '@yohira/base';

class ChainItemInfo {
	constructor(readonly order: number, readonly implCtor: Ctor | undefined) {}
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteChain.cs,ae1fab1640004f66,references
export class CallSiteChain {
	private readonly callSiteChain: Map<symbol, ChainItemInfo>;

	constructor() {
		this.callSiteChain = new Map<symbol, ChainItemInfo>();
	}

	private createCircularDependencyErrorMessage(type: symbol): string {
		// TODO
		return `A circular dependency was detected for the service of type '${Symbol.keyFor(
			type,
		)}'.`; /* LOC */
	}

	checkCircularDependency(serviceType: symbol): void {
		if (this.callSiteChain.has(serviceType)) {
			throw new Error(
				this.createCircularDependencyErrorMessage(serviceType),
			);
		}
	}

	remove(serviceType: symbol): void {
		this.callSiteChain.delete(serviceType);
	}

	add(serviceType: symbol, implCtor: Ctor | undefined): void {
		this.callSiteChain.set(
			serviceType,
			new ChainItemInfo(this.callSiteChain.size, implCtor),
		);
	}
}
