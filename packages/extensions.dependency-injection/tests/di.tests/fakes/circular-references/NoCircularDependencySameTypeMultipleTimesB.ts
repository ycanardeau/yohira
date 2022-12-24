import { inject } from 'inversify';

import { NoCircularDependencySameTypeMultipleTimesC } from './NoCircularDependencySameTypeMultipleTimesC';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/Fakes/CircularReferences/NoCircularDependencySameTypeMultipleTimesB.cs#L6
export class NoCircularDependencySameTypeMultipleTimesB {
	constructor(
		@inject('NoCircularDependencySameTypeMultipleTimesC')
		readonly c: NoCircularDependencySameTypeMultipleTimesC,
	) {}
}
