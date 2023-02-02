import { Ctor } from './Ctor';

interface TypedefOptions {
	extends?: symbol;
	implements?: readonly symbol[];
}

interface ClassMetadata {
	ctor: Ctor;
	compatibleTypes: Set<symbol>;
}

const classMetadataMap = new Map<symbol, ClassMetadata>();

export function typedef(options?: TypedefOptions): (ctor: Ctor) => void {
	return (ctor) => {
		const type = Symbol.for(ctor.name);
		if (classMetadataMap.has(type)) {
			// TODO: throw new Error(/* TODO: message */);
			return;
		}

		const set = new Set<symbol>();
		set.add(type);
		if (options !== undefined) {
			if (options.extends !== undefined) {
				set.add(options.extends);
			}

			if (options.implements !== undefined) {
				for (const implement of options.implements) {
					set.add(implement);
				}
			}
		}
		classMetadataMap.set(type, { ctor: ctor, compatibleTypes: set });
	};
}

export function getType(instance: object): symbol {
	return Symbol.for(instance.constructor.name);
}

export function getClassMetadata(type: symbol): ClassMetadata {
	const metadata = classMetadataMap.get(type);
	if (metadata === undefined) {
		throw new Error(/* TODO: message */);
	}
	return metadata;
}

export function isCompatibleWith(left: symbol, right: symbol): boolean {
	const { compatibleTypes } = getClassMetadata(left);
	return compatibleTypes.has(right);
}
