import http from 'http';

class WebApp {
	private listen = (): void => {
		// LOG
		const server = http /* REVIEW: https, http2 */
			.createServer((_request, response) => {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(
					JSON.stringify({
						data: 'Hello, World!',
					}),
				);
			});
		server.listen(5000 /* TODO */);
		// TODO: Clean up.
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
