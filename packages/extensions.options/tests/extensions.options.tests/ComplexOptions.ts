// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/ComplexOptions.cs#L31
class NestedOptions {
	integer!: number;
}

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/ComplexOptions.cs#L8
export class ComplexOptions {
	nested: NestedOptions;
	integer!: number;
	boolean!: boolean;

	private _virtual!: string;
	get virtual(): string {
		return this._virtual;
	}
	set virtual(value: string) {
		this._virtual = value;
	}

	static staticProperty: string;

	constructor() {
		this.nested = new NestedOptions();
		this.virtual = 'complex';
	}
}

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/ComplexOptions.cs#L36
export class DerivedOptions extends ComplexOptions {
	get virtual(): string {
		return super.virtual;
	}
	set virtual(value: string) {
		super.virtual = `derived:${value}`;
	}
}
