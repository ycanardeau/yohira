import { inject } from '@yohira/extensions.dependency-injection.abstractions';

import { ISelfCircularDependencyWithInterface } from './ISelfCircularDependencyWithInterface';

export class SelfCircularDependencyWithInterface
	implements ISelfCircularDependencyWithInterface
{
	constructor(
		@inject(ISelfCircularDependencyWithInterface)
		self: ISelfCircularDependencyWithInterface,
	) {}
}
