import { inject } from '@yohira/extensions.dependency-injection.abstractions';

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
		@inject(Symbol.for('NoCircularDependencySameTypeMultipleTimesB'))
		readonly b: NoCircularDependencySameTypeMultipleTimesB,
		@inject(Symbol.for('NoCircularDependencySameTypeMultipleTimesC'))
		readonly c1: NoCircularDependencySameTypeMultipleTimesC,
		@inject(Symbol.for('NoCircularDependencySameTypeMultipleTimesC'))
		readonly c2: NoCircularDependencySameTypeMultipleTimesC,
	) {}
}
