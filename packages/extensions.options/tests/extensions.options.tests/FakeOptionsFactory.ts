import { IOptionsFactory } from '@yohira/extensions.options';

import { FakeOptions } from './FakeOptions';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/FakeOptionsFactory.cs#L6
export class FakeOptionsFactory implements IOptionsFactory<FakeOptions> {
	static options = new FakeOptions();

	create(): FakeOptions {
		return FakeOptionsFactory.options;
	}
}
