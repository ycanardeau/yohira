import { IFactoryService } from './IFactoryService';
import { IFakeService } from './IFakeService';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection.Specification.Tests/src/Fakes/TransientFactoryService.cs#L6
export class TransientFactoryService implements IFactoryService {
	fakeService!: IFakeService;
	value!: number;
}
