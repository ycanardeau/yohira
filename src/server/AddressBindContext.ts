import { ListenOptions } from '@/server/ListenOptions';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/AddressBindContext.cs#L8
export class AddressBindContext {
	constructor(
		readonly createBinding: (
			options: ListenOptions /* TODO */,
		) => Promise<void>,
	) {}
}
