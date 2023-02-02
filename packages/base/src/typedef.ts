import { Ctor } from './Ctor';

interface TypedefOptions {
	extends?: symbol;
	implements?: readonly symbol[];
}

const ctorTypeMap = new Map<Ctor, symbol>();
const typeTypesMap = new Map<symbol, Set<symbol>>();

export function typedef(
	type: symbol,
	options?: TypedefOptions,
): (ctor: Ctor) => void {
	return (ctor) => {
		if (ctorTypeMap.has(ctor) || typeTypesMap.has(type)) {
			// TODO: throw new Error(/* TODO: message */);
			return;
		}

		ctorTypeMap.set(ctor, type);

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
		typeTypesMap.set(type, set);
	};
}

export function getType(instance: object): symbol {
	const type = ctorTypeMap.get(instance.constructor as Ctor);
	if (type === undefined) {
		throw new Error(/* TODO: message */);
	}

	return type;
}

export function isCompatibleWith(left: symbol, right: symbol): boolean {
	const types = typeTypesMap.get(left);
	if (types === undefined) {
		throw new Error(/* TODO: message */);
	}

	return types.has(right);
}
