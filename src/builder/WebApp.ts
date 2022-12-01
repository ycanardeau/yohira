import { HostAppBuilder } from '@/hosting/HostAppBuilder';
import { IHost, runHost } from '@/hosting/IHost';

// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L21
class WebApp implements IHost {
	constructor(private readonly host: IHost) {}

	// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L125
	start = (): Promise<void> => {
		return this.host.start();
	};

	// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L197
	private listen = (): void => {
		// IMPL
	};

	// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L146
	run = (): Promise<void> => {
		this.listen();
		return runHost(this);
	};
}

// https://github.com/dotnet/aspnetcore/blob/14c39984660a8cefb09a8d77331b47ffc48d7a22/src/DefaultBuilder/src/WebApplicationBuilder.cs#L18
class WebAppBuilder {
	private readonly hostAppBuilder: HostAppBuilder;

	constructor() {
		this.hostAppBuilder = new HostAppBuilder(/* TODO */);
	}

	// https://github.com/dotnet/aspnetcore/blob/14c39984660a8cefb09a8d77331b47ffc48d7a22/src/DefaultBuilder/src/WebApplicationBuilder.cs#L125
	build = (): WebApp => {
		return new WebApp(this.hostAppBuilder.build());
	};
}

export const createWebAppBuilder = (): WebAppBuilder => {
	return new WebAppBuilder();
};
