import { Err, Ok, Result } from 'ts-results-es';

export const getOrAdd = <K, V>(
	map: Map<K, V>,
	key: K,
	valueFactory: (key: K) => V,
): V => {
	if (map.has(key)) {
		return map.get(key) as V;
	} else {
		const value = valueFactory(key);
		map.set(key, value);
		return value;
	}
};

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
