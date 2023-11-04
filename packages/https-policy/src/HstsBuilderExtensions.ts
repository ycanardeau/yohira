import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { HstsMiddleware } from './HstsMiddleware';

export function useHsts(app: IAppBuilder): IAppBuilder {
	return useMiddleware(HstsMiddleware, app);
}
