import { StatusCodes } from '@yohira/http.abstractions';
import { ConflictResult } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ConflictResultTest.cs#L11C17-L11C53
test('ConflictResult_InitializesStatusCode', () => {
	const conflictResult = new ConflictResult();

	expect(conflictResult.statusCode).toBe(StatusCodes.Status409Conflict);
});
