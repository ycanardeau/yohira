import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { SessionMiddleware } from './SessionMiddleware';

export function useSession(app: IAppBuilder): IAppBuilder {
	return useMiddleware(SessionMiddleware, app);
}
