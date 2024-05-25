import { StatusCodes } from '@yohira/http.abstractions';
import { NotFoundResult } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/HttpNotFoundResultTests.cs#L11C17-L11C57
test('HttpNotFoundResult_InitializesStatusCode', () => {
	const notFound = new NotFoundResult();

	expect(notFound.statusCode).toBe(StatusCodes.Status404NotFound);
});
