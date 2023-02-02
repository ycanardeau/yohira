import { Ctor } from '@yohira/base';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';

import { IAppBuilder } from '../IAppBuilder';
import { IMiddleware } from '../IMiddleware';
import { use } from '../extensions/UseExtensions';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseMiddlewareExtensions.cs,e940dbf3ad65ffe4,references
export function useMiddleware<T extends IMiddleware>(
	ctor: Ctor<T>,
	app: IAppBuilder,
): IAppBuilder {
	return use(app, async (context, next) => {
		const middleware = getRequiredService<T>(
			context.requestServices,
			Symbol.for(ctor.name),
		);
		await middleware.invoke(context, next);
	});
}
