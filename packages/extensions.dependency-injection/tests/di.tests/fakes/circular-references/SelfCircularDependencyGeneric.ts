import { inject } from 'inversify';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/Fakes/CircularReferences/SelfCircularDependencyGeneric.cs#L6
export class SelfCircularDependencyGeneric<TDependency> {
	constructor(
		@inject('SelfCircularDependencyGeneric<string>')
		self?: SelfCircularDependencyGeneric<string>,
	) {}
}
