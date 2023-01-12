// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/BindingPoint.cs,54b2cc589b0b3c04,references
export class BindingPoint {
	private _setValue?: object;
	private valueSet = false;

	constructor(
		private initialValue: object | undefined = undefined,
		private readonly initialValueProvider?: () => object | undefined,
		readonly isReadonly = false,
	) {}

	get hasNewValue(): boolean {
		if (this.isReadonly) {
			return false;
		}

		if (this.valueSet) {
			return true;
		}

		return false /* TODO */;
	}

	get value(): object | undefined {
		return this.valueSet
			? this._setValue
			: (this.initialValue ??= this.initialValueProvider?.());
	}

	setValue(newValue: object | undefined): void {
		if (this.isReadonly) {
			throw new Error('Assertion failed.');
		}
		if (this.valueSet) {
			throw new Error('Assertion failed.');
		}
		this._setValue = newValue;
		this.valueSet = true;
	}

	trySetValue(newValue: object | undefined): void {
		if (!this.isReadonly) {
			this.setValue(newValue);
		}
	}
}
