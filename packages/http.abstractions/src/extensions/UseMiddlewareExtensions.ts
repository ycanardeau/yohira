import { Ctor, Type } from '@yohira/base/Type';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { IMiddleware } from '@yohira/http.abstractions/IMiddleware';
import { use } from '@yohira/http.abstractions/extensions/UseExtensions';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseMiddlewareExtensions.cs,e940dbf3ad65ffe4,references
export function useMiddleware<T extends IMiddleware>(
	app: IAppBuilder,
	ctor: Ctor<T>,
): IAppBuilder {
	return use(app, async (context, next) => {
		const middleware = getRequiredService<T>(
			context.requestServices,
			Type.from(ctor.name),
		);
		await middleware.invoke(context, next);
	});
}
