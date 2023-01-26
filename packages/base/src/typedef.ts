import { Ctor, Type } from './Type';

interface TypedefOptions {
	extends?: Type;
	implements?: readonly Type[];
}

const ctorTypeMap = new Map<Ctor, Type>();
const typeTypesMap = new Map<
	string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
	Set<string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */>
>();

export function typedef(
	type: Type,
	options?: TypedefOptions,
): (ctor: Ctor) => void {
	return (ctor) => {
		if (ctorTypeMap.has(ctor) || typeTypesMap.has(type.value)) {
			throw new Error(/* TODO: message */);
		}

		ctorTypeMap.set(ctor, type);

		const set =
			new Set<string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */>();
		set.add(type.value);
		if (options !== undefined) {
			if (options.extends !== undefined) {
				set.add(options.extends.value);
			}

			if (options.implements !== undefined) {
				for (const implement of options.implements) {
					set.add(implement.value);
				}
			}
		}
		typeTypesMap.set(type.value, set);
	};
}

export function getType(instance: object): Type {
	const type = ctorTypeMap.get(instance.constructor as Ctor);
	if (type === undefined) {
		throw new Error(/* TODO: message */);
	}

	return type;
}

export function isCompatibleWith(left: Type, right: Type): boolean {
	const types = typeTypesMap.get(left.value);
	if (types === undefined) {
		throw new Error(/* TODO: message */);
	}

	return types.has(right.value);
}
