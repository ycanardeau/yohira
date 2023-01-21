import { IHttpContext } from '@yohira/http.abstractions';

export const emptyRequestDelegate = (context: IHttpContext): Promise<void> =>
	Promise.resolve();
