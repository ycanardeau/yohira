export class Lazy<T> {
	constructor(private readonly valueFactory: () => T) {}

	static from<T>(value: T): Lazy<T> {
		return new Lazy(() => value);
	}

	private _value?: T;
	get value(): T {
		if (this._value !== undefined) {
			return this._value;
		} else {
			this._value = this.valueFactory();
			return this._value;
		}
	}
}
