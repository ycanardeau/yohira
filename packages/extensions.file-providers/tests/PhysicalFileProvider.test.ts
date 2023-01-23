import { IDisposable, combinePaths, getTempPath } from '@yohira/base';
import {
	NotFoundFileInfo,
	PhysicalFileInfo,
	PhysicalFileProvider,
} from '@yohira/extensions.file-providers';
import { randomUUID } from 'node:crypto';
import { cwd } from 'node:process';
import { expect, test } from 'vitest';

async function using<T extends IDisposable>(
	disposable: T,
	action: (disposable: T) => Promise<void>,
): Promise<void> {
	try {
		await action(disposable);
	} finally {
		await disposable.dispose();
	}
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L34
test('GetFileInfoReturnsNotFoundFileInfoForEmptyPath', async () => {
	await using(new PhysicalFileProvider(getTempPath()), async (provider) => {
		const info = await provider.getFileInfo('');
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
});

async function GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
	path: string,
): Promise<void> {
	await using(new PhysicalFileProvider(getTempPath()), async (provider) => {
		const info = await provider.getFileInfo(path);
		expect(info).toBeInstanceOf(PhysicalFileInfo);
	});
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L50
test('GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes_Windows', async () => {
	await GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
		'/',
	);
	await GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
		'///',
	);
	await GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
		'/\\/',
	);
	await GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
		'\\/\\/',
	);
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L60
test('GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes_Unix', async () => {
	await GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
		'/',
	);
	await GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
		'///',
	);
});

async function GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes(
	path: string,
): Promise<void> {
	await using(new PhysicalFileProvider(getTempPath()), async (provider) => {
		const info = await provider.getFileInfo(path);
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L79
test('GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes_Windows', async () => {
	await GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes(
		'/C:\\Windows\\System32',
	);
	await GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes(
		'/\0/',
	);
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L88
test('GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes_Unix', async () => {
	await GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes(
		'/\0/',
	);
});

// TODO

const invalidPaths = [
	combinePaths('. .', 'file'),
	combinePaths(' ..', 'file'),
	combinePaths('.. ', 'file'),
	combinePaths(' .', 'file'),
	combinePaths('. ', 'file'),
] as const;

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L167
test('GetFileInfoReturnsNonExistentFileInfoForIllegalPath', async () => {
	async function GetFileInfoReturnsNonExistentFileInfoForIllegalPath(
		path: string,
	): Promise<void> {
		await using(
			new PhysicalFileProvider(getTempPath()),
			async (provider) => {
				const info = await provider.getFileInfo(path);
				expect(await info.exists()).toBe(false);
			},
		);
	}

	for (const path of invalidPaths) {
		await GetFileInfoReturnsNonExistentFileInfoForIllegalPath(path);
	}
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L179
test('GetFileInfoReturnsNotFoundFileInfoForAbsolutePath', async () => {
	await using(new PhysicalFileProvider(getTempPath()), async (provider) => {
		const info = await provider.getFileInfo(
			combinePaths(getTempPath(), randomUUID()),
		);
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L189
test('GetFileInfoReturnsNotFoundFileInfoForRelativePathAboveRootPath', async () => {
	await using(new PhysicalFileProvider(getTempPath()), async (provider) => {
		const info = await provider.getFileInfo(
			combinePaths('..', randomUUID()),
		);
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
});

// TODO

async function InvalidPath_DoesNotThrowGeneric_GetFileInfo(
	path: string,
): Promise<void> {
	await using(new PhysicalFileProvider(cwd()), async (provider) => {
		const info = await provider.getFileInfo(path);
		expect(info).not.toBeUndefined();
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L513
test('InvalidPath_DoesNotThrowWindows_GetFileInfo', async () => {
	await InvalidPath_DoesNotThrowGeneric_GetFileInfo('/test:test');
	await InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir/name"');
	await InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir>/name');
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L523
test('InvalidPath_DoesNotThrowUnix_GetFileInfo', async () => {
	await InvalidPath_DoesNotThrowGeneric_GetFileInfo('/test:test\0');
	await InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir/\0name"');
	await InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir>/name\0');
});

// TODO
