import { IList } from '@yohira/base/IList';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/IServiceCollection.cs,2f0e403ea0d41c8e,references
export type IServiceCollection = IList<ServiceDescriptor>;
