export interface IHost {
	start(): Promise<void>;
	// TODO: stop(): Promise<void>;
}

export const runHost = async (host: IHost): Promise<void> => {
	await host.start();
};
