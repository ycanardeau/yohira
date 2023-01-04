// https://source.dot.net/#Microsoft.Extensions.Configuration.Binder/BindingPoint.cs,54b2cc589b0b3c04,references
export class BindingPoint {
	private readonly initialValueProvider?: () => object | undefined;
	private _setValue?: object;
	private valueSet = false;

	constructor(
		private initialValue: object | undefined = undefined,
		readonly isReadonly = false,
	) {}

	get value(): object | undefined {
		return this.valueSet
			? this._setValue
			: (this.initialValue ??= this.initialValueProvider?.());
	}

	setValue = (newValue: object | undefined): void => {
		if (this.isReadonly) {
			throw new Error('Assertion failed.');
		}
		if (this.valueSet) {
			throw new Error('Assertion failed.');
		}
		this._setValue = newValue;
		this.valueSet = true;
	};

	trySetValue = (newValue: object | undefined): void => {
		if (!this.isReadonly) {
			this.setValue(newValue);
		}
	};
}
