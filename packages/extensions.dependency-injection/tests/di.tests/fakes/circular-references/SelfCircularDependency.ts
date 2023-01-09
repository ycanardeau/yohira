import { Type } from '@yohira/base/Type';
import { inject } from '@yohira/extensions.dependency-injection.abstractions/inject';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/Fakes/CircularReferences/SelfCircularDependency.cs#L6
export class SelfCircularDependency {
	constructor(
		@inject(Type.from('SelfCircularDependency'))
		readonly self: SelfCircularDependency,
	) {}
}
