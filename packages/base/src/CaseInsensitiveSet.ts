export class CaseInsensitiveSet extends Set<string> {
	add(value: string): this {
		return super.add(value.toLowerCase());
	}

	delete(value: string): boolean {
		return super.delete(value.toLowerCase());
	}

	has(value: string): boolean {
		return super.has(value.toLowerCase());
	}
}
