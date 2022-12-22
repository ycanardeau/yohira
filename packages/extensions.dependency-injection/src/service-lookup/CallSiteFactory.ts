import { ICollection } from '@yohira/base/ICollection';
import { Type } from '@yohira/base/Type';
import { IServiceProviderIsService } from '@yohira/extensions.dependency-injection.abstractions/IServiceProviderIsService';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { CallSiteChain } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteChain';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteFactory.cs,b3200cd3834458b8,references
export class CallSiteFactory implements IServiceProviderIsService {
	constructor(descriptors: ICollection<ServiceDescriptor>) {}

	getCallSite = (
		serviceType: Type,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined => {
		// TODO
		throw new Error('Method not implemented.');
	};

	isService = (serviceType: Type): boolean => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
