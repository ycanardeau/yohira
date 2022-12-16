import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IMiddleware.cs,823fea480ad08b55,references
export interface IMiddleware {
	invoke(context: IHttpContext, next: RequestDelegate): Promise<void>;
}
