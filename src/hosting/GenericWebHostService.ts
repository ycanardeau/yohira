import { IHostedService } from '@/hosting/IHostedService';
import { injectable } from 'inversify';

@injectable()
export class GenericWebHostService implements IHostedService {
	start = async (): Promise<void> => {
		// IMPL
	};
}
