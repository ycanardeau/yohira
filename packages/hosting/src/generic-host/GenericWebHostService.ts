import { IHostedService } from '@yohira/hosting.abstractions/IHostedService';
import { injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/GenericWebHostService.cs,fd20321226ab7078,references
@injectable()
export class GenericWebHostService implements IHostedService {
	start = (): Promise<void> => {
		throw new Error('Method not implemented.');
	};

	stop = (): Promise<void> => {
		throw new Error('Method not implemented.');
	};
}
