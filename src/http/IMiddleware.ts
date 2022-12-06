import { IHttpContext } from '@/http/IHttpContext';
import { RequestDelegate } from '@/http/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IMiddleware.cs,823fea480ad08b55,references
export interface IMiddleware {
	invoke(context: IHttpContext, next: RequestDelegate): Promise<void>;
}