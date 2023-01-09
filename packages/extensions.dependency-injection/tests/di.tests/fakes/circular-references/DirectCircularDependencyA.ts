import { Type } from '@yohira/base/Type';
import { inject } from '@yohira/extensions.dependency-injection.abstractions/inject';

import { DirectCircularDependencyB } from './DirectCircularDependencyB';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/Fakes/CircularReferences/DirectCircularDependencyA.cs#L6
export class DirectCircularDependencyA {
	constructor(
		@inject(Type.from('DirectCircularDependencyB'))
		readonly b: DirectCircularDependencyB,
	) {}
}
