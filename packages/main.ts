import { createWebAppBuilder } from '@yohira/core';
import { addHttpLogging, useHttpLogging } from '@yohira/http-logging';
import { addStaticFiles, useStaticFiles } from '@yohira/static-files';

export async function main(): Promise<void> {
	const builder = createWebAppBuilder(/* TODO */);

	addStaticFiles(builder.services);

	addHttpLogging(builder.services);

	// TODO

	const app = builder.build();

	useStaticFiles(app);

	useHttpLogging(app);

	await app.run();
}
