import { IHostedService } from '@/hosting/IHostedService';
import { injectable } from 'inversify';

// https://github.com/dotnet/aspnetcore/blob/600eb9aa53c052ec7327e2399744215dbe493a89/src/Hosting/Hosting/src/GenericHost/GenericWebHostService.cs#L17
@injectable()
export class GenericWebHostService implements IHostedService {
	start = async (): Promise<void> => {
		// IMPL
	};
}
