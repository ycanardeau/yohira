import { Err, Ok, Result } from 'ts-results-es';

export const tryGetValue = <K, V>(
	map: Map<K, V>,
	key: K,
): Result<V, undefined> => {
	if (map.has(key)) {
		return new Ok(map.get(key) as V);
	} else {
		return new Err(undefined);
	}
};

export const getOrAdd = <K, V>(
	map: Map<K, V>,
	key: K,
	valueFactory: (key: K) => V,
): V => {
	const tryGetValueResult = tryGetValue(map, key);
	if (tryGetValueResult.ok) {
		return tryGetValueResult.val;
	}
	const value = valueFactory(key);
	map.set(key, value);
	return value;
};

export const getOrAddWithArgument = <K, V, TArg>(
	map: Map<K, V>,
	key: K,
	valueFactory: (key: K, arg: TArg) => V,
	factoryArgument: TArg,
): V => {
	const tryGetValueResult = tryGetValue(map, key);
	if (tryGetValueResult.ok) {
		return tryGetValueResult.val;
	}
	const value = valueFactory(key, factoryArgument);
	map.set(key, value);
	return value;
};
