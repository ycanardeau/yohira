import { IHostedService } from '@/hosting/IHostedService';
import { IOptions } from '@/options/IOptions';
import { TYPES } from '@/types';
import { inject, injectable } from 'inversify';

// https://github.com/dotnet/aspnetcore/blob/600eb9aa53c052ec7327e2399744215dbe493a89/src/Hosting/Hosting/src/GenericHost/GenericWebHostServiceOptions.cs#L8
export class GenericWebHostServiceOptions {}

// https://github.com/dotnet/aspnetcore/blob/600eb9aa53c052ec7327e2399744215dbe493a89/src/Hosting/Hosting/src/GenericHost/GenericWebHostService.cs#L17
@injectable()
export class GenericWebHostService implements IHostedService {
	readonly options: GenericWebHostServiceOptions;

	constructor(
		@inject(TYPES.IOptions)
		options: IOptions<GenericWebHostServiceOptions>,
	) {
		this.options = options.value;
	}

	start = async (): Promise<void> => {
		// IMPL
	};
}
