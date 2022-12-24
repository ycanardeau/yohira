import { inject } from 'inversify';

import { NoCircularDependencySameTypeMultipleTimesB } from './NoCircularDependencySameTypeMultipleTimesB';
import { NoCircularDependencySameTypeMultipleTimesC } from './NoCircularDependencySameTypeMultipleTimesC';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/Fakes/CircularReferences/NoCircularDependencySameTypeMultipleTimesA.cs#L11
//    A
//  / | \
// B  C  C
// |
// C
export class NoCircularDependencySameTypeMultipleTimesA {
	constructor(
		@inject('NoCircularDependencySameTypeMultipleTimesB')
		readonly b: NoCircularDependencySameTypeMultipleTimesB,
		@inject('NoCircularDependencySameTypeMultipleTimesC')
		readonly c1: NoCircularDependencySameTypeMultipleTimesC,
		@inject('NoCircularDependencySameTypeMultipleTimesC')
		readonly c2: NoCircularDependencySameTypeMultipleTimesC,
	) {}
}
