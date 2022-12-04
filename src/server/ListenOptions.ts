import {
	ConnectionDelegate,
	IConnectionBuilder,
} from '@/connections/IConnectionBuilder';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/ListenOptions.cs#L17
export class ListenOptions implements IConnectionBuilder {
	private readonly middleware: ((
		next: ConnectionDelegate,
	) => ConnectionDelegate)[] = [];

	use = (
		middleware: (next: ConnectionDelegate) => ConnectionDelegate,
	): this => {
		this.middleware.push(middleware);
		return this;
	};

	build = (): ConnectionDelegate => {
		let app = (/* TODO */): Promise<void> => {
			return Promise.resolve();
		};

		for (let i = this.middleware.length - 1; i >= 0; i--) {
			const component = this.middleware[i];
			app = component(app);
		}

		return app;
	};
}
