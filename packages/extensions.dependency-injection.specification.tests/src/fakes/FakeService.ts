import { IDisposable } from '@yohira/base/IDisposable';
import { IFakeEveryService } from '@yohira/extensions.dependency-injection.specification.tests/fakes/IFakeEveryService';

// https://github.com/dotnet/runtime/blob/279fb0436f475fbc35ffeff68330f970ee77831a/src/libraries/Microsoft.Extensions.DependencyInjection.Specification.Tests/src/Fakes/FakeService.cs#L8
export class FakeService implements IFakeEveryService, IDisposable {
	dispose = async (): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
