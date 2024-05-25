import { StatusCodes } from '@yohira/http.abstractions';
import { BadRequestResult } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/BadRequestResultTests.cs#L11
test('BadRequestResult_InitializesStatusCode', () => {
	const badRequest = new BadRequestResult();

	expect(badRequest.statusCode).toBe(StatusCodes.Status400BadRequest);
});
