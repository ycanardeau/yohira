import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';

import { ContentResultExecutor } from '../infrastructure/ContentResultExecutor';
import { FileContentResultExecutor } from '../infrastructure/FileContentResultExecutor';
import { FileStreamResultExecutor } from '../infrastructure/FileStreamResultExecutor';
import { JsonResultExecutor } from '../infrastructure/JsonResultExecutor';
import { PhysicalFileResultExecutor } from '../infrastructure/PhysicalFileResultExecutor';
import { VirtualFileResultExecutor } from '../infrastructure/VirtualFileResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/DependencyInjection/MvcCoreServiceCollectionExtensions.cs,633ab8f2eb7452b9,references
export function addMvcCoreServices(services: IServiceCollection): void {
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IActionResultExecutor<PhysicalFileResult>'),
			PhysicalFileResultExecutor,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IActionResultExecutor<VirtualFileResult>'),
			VirtualFileResultExecutor,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IActionResultExecutor<FileStreamResult>'),
			FileStreamResultExecutor,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IActionResultExecutor<FileContentResult>'),
			FileContentResultExecutor,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IActionResultExecutor<ContentResult>'),
			ContentResultExecutor,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IActionResultExecutor<JsonResult>'),
			JsonResultExecutor,
		),
	);
}
