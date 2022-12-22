// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/FakeOptions.cs#L6
export class FakeOptions {
	message: string;

	constructor() {
		this.message = '';
	}
}
