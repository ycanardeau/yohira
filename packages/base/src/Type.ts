export function keyForType(type: symbol): string {
	return Symbol.keyFor(type)!;
}
