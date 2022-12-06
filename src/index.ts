import { App } from '@/App';
import { HttpContext } from '@/http/HttpContext';
import { container } from '@/inversify.config';
import { ILogger } from '@/logging/ILogger';
import {
	addStaticFiles,
	useStaticFiles,
} from '@/middleware/staticFiles/StaticFileMiddleware';

// TODO
const logger: ILogger = {
	debug: (message, ...optionalParams) =>
		console.debug(message, ...optionalParams),
	warn: (message, ...optionalParams) =>
		console.warn(message, ...optionalParams),
};
container
	.bind(ILogger)
	.toDynamicValue(() => logger)
	.inSingletonScope();
addStaticFiles(container);

const main = async (): Promise<void> => {
	const app = new App(logger);

	useStaticFiles(app);

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
