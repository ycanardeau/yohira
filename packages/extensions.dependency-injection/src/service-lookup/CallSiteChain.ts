import { Ctor, keyForType } from '@yohira/base';

class ChainItemInfo {
	constructor(readonly order: number, readonly implCtor: Ctor | undefined) {}
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteChain.cs,ae1fab1640004f66,references
export class CallSiteChain {
	private readonly callSiteChain: Map<symbol, ChainItemInfo>;

	constructor() {
		this.callSiteChain = new Map<symbol, ChainItemInfo>();
	}

	private appendResolutionPath(
		builder: string[],
		currentlyResolving: symbol,
	): void {
		const ordered = this.callSiteChain.entries();
		// TODO: sort

		for (const [serviceType, value] of ordered) {
			const implCtor = value.implCtor;
			if (
				implCtor === undefined ||
				serviceType === Symbol.for(implCtor.name)
			) {
				builder.push(keyForType(serviceType));
			} else {
				builder.push(keyForType(serviceType), '(', implCtor.name, ')');
			}

			builder.push(' -> ');
		}

		builder.push(keyForType(currentlyResolving));
	}

	private createCircularDependencyErrorMessage(type: symbol): string {
		const messageBuilder: string[] = [];
		messageBuilder.push(
			`A circular dependency was detected for the service of type '${keyForType(
				type,
			)}'.` /* LOC */,
		);
		messageBuilder.push('\n');

		this.appendResolutionPath(messageBuilder, type);

		return messageBuilder.join('');
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
