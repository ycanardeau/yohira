class WebApp {
	private listen = (): void => {
		console.log('Hello, World!');
	};

	run = (): void => {
		this.listen();
	};
}

class WebAppBuilder {
	build = (): WebApp => {
		return new WebApp();
	};
}

export const createWebAppBuilder = (): WebAppBuilder => {
	return new WebAppBuilder();
};
