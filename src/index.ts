import { App, HttpContext } from '@/App';

const main = async (): Promise<void> => {
	const app = new App({
		debug: (message, ...optionalParams) =>
			console.debug(message, ...optionalParams),
		warn: (message, ...optionalParams) =>
			console.warn(message, ...optionalParams),
	});

	app.use(async (context, next) => {
		if (!(context instanceof HttpContext)) {
			throw new Error('context must be of type HttpContext');
		}

		const { nativeResponse } = context;
		nativeResponse.writeHead(200, { 'Content-Type': 'application/json' });
		nativeResponse.end(
			JSON.stringify({
				data: 'Hello, World!',
			}),
		);

		await next(context);
	});

	app.listen(8000);
};

main();
