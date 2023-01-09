import { Type } from '@yohira/base/Type';
import { inject } from '@yohira/extensions.dependency-injection.abstractions/inject';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/Fakes/CircularReferences/SelfCircularDependencyGeneric.cs#L6
export class SelfCircularDependencyGeneric<TDependency> {
	constructor(
		@inject(Type.from('SelfCircularDependencyGeneric<string>'))
		readonly self?: SelfCircularDependencyGeneric<string>,
	) {}
}
