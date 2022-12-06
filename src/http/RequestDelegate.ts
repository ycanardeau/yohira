import { IHttpContext } from '@/http/IHttpContext';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/RequestDelegate.cs,51d975d94569085b,references
export type RequestDelegate = (context: IHttpContext) => Promise<void>;
