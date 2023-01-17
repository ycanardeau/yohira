import { Ctor, getOrAdd } from '@yohira/base';

export interface PropertyInfo {
	target: any;
	name: string;
	ctorFunc: () => Ctor;
}

type PropertyInfoMap = Map<string, PropertyInfo>;
const propertyInfoMaps = new Map<Ctor, PropertyInfoMap>();

function addPropertyInfo(propertyInfo: PropertyInfo): void {
	const propertyInfoMap = getOrAdd(
		propertyInfoMaps,
		propertyInfo.target.constructor,
		() => new Map<string, PropertyInfo>(),
	);
	propertyInfoMap.set(propertyInfo.name, propertyInfo);
}

export function getProperties(target: Ctor): PropertyInfo[] {
	const propertyInfoMap = propertyInfoMaps.get(target);
	if (propertyInfoMap === undefined) {
		throw new Error(/* TODO: message */);
	}
	return Array.from(propertyInfoMap.values());
}

export function type(
	ctorFunc: () => Ctor,
): (
	target: any,
	propertyKey: string,
	descriptor?: TypedPropertyDescriptor<any>,
) => void {
	return (target, propertyKey) => {
		const propertyInfo = {
			target: target,
			name: propertyKey,
			ctorFunc: ctorFunc,
		};
		addPropertyInfo(propertyInfo);
	};
}
