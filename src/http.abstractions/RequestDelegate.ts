import { IHttpContext } from '@/http.abstractions/IHttpContext';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/RequestDelegate.cs,51d975d94569085b,references
export type RequestDelegate = (context: IHttpContext) => Promise<void>;
