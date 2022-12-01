import { IHost } from '@/hosting/IHost';

const resolveHost = (): IHost => {
	return {
		start: async (): Promise<void> => {
			console.log('start');
		},
	}; /* IMPL */
};

export class HostAppBuilder {
	build = (): IHost => {
		return resolveHost(/* TODO */);
	};
}
