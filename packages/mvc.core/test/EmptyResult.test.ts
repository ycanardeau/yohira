import { IHttpContext } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';
import { EmptyResult } from '@yohira/mvc.core';
import { test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/EmptyResultTests.cs#L14C17-L14C50
test('EmptyResult_ExecuteResult_IsANoOp', () => {
	const emptyResult = new EmptyResult();

	const httpContext: IHttpContext = {} as IHttpContext;

	const context = new ActionContext(httpContext);

	emptyResult.executeResultSync(context);
});
