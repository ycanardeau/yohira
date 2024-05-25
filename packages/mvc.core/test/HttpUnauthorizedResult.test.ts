import { StatusCodes } from '@yohira/http.abstractions';
import { UnauthorizedResult } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/HttpUnauthorizedResultTests.cs#L11C17-L11C61
test('HttpUnauthorizedResult_InitializesStatusCode', () => {
	const result = new UnauthorizedResult();

	expect(result.statusCode).toBe(StatusCodes.Status401Unauthorized);
});
