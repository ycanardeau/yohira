import { IHttpContext } from './IHttpContext';

export const IHttpContextAccessor = Symbol.for('IHttpContextAccessor');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IHttpContextAccessor.cs,fe18ee6b17223921,references
export interface IHttpContextAccessor {
	httpContext: IHttpContext | undefined;
}
