import { Http1Connection } from '@yohira/server.node.core';

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/shared/test/TestHttp1Connection.cs#L10
export class TestHttp1Connection extends Http1Connection {}
