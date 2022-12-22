import { Type } from '@yohira/base/Type';
import { IServiceScope } from '@yohira/extensions.dependency-injection.abstractions/IServiceScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteValidator.cs,80039ca1254de7d7,references
export class CallSiteValidator {
	validateResolution = (
		serviceType: Type,
		scope: IServiceScope,
		rootScope: IServiceScope,
	): void => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
