import { inject } from '@yohira/extensions.dependency-injection.abstractions';

import { DirectCircularDependencyA } from './DirectCircularDependencyA';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/Fakes/CircularReferences/DependencyOnCircularDependency.cs#L6
export class DependencyOnCircularDependency {
	constructor(
		@inject(Symbol.for('DirectCircularDependencyA'))
		readonly a: DirectCircularDependencyA,
	) {}
}
