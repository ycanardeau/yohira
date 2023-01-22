export class CaseInsensitiveMap<V> extends Map<string, V> {
	delete(key: string): boolean {
		return super.delete(key.toLowerCase());
	}

	get(key: string): V | undefined {
		return super.get(key.toLowerCase());
	}

	has(key: string): boolean {
		return super.has(key.toLowerCase());
	}

	set(key: string, value: V): this {
		return super.set(key.toLowerCase(), value);
	}
}
