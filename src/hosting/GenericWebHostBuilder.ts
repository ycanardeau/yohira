import { IHostBuilder } from '@/hosting/IHostBuilder';
import { WebHostBuilderOptions } from '@/hosting/WebHostBuilderOptions';

export class GenericWebHostBuilder {
	constructor(
		private readonly builder: IHostBuilder,
		options: WebHostBuilderOptions,
	) {}
}
