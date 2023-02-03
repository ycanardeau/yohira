import { IDisposable, combinePaths, getTempPath } from '@yohira/base';
import {
	NotFoundFileInfo,
	PhysicalFileInfo,
	PhysicalFileProvider,
} from '@yohira/extensions.file-providers';
import { randomUUID } from 'node:crypto';
import { cwd } from 'node:process';
import { expect, test } from 'vitest';

function using<T extends IDisposable>(
	disposable: T,
	action: (disposable: T) => void,
): void {
	try {
		action(disposable);
	} finally {
		disposable.dispose();
	}
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L34
test('GetFileInfoReturnsNotFoundFileInfoForEmptyPath', () => {
	using(new PhysicalFileProvider(getTempPath()), (provider) => {
		const info = provider.getFileInfoSync('');
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
});

function GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes(
	path: string,
): void {
	using(new PhysicalFileProvider(getTempPath()), (provider) => {
		const info = provider.getFileInfoSync(path);
		expect(info).toBeInstanceOf(PhysicalFileInfo);
	});
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L50
test('GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes_Windows', () => {
	GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes('/');
	GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes('///');
	GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes('/\\/');
	GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes('\\/\\/');
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L60
test('GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes_Unix', () => {
	GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes('/');
	GetFileInfoReturnsPhysicalFileInfoForValidPathsWithLeadingSlashes('///');
});

function GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes(
	path: string,
): void {
	using(new PhysicalFileProvider(getTempPath()), (provider) => {
		const info = provider.getFileInfoSync(path);
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L79
test('GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes_Windows', () => {
	GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes(
		'/C:\\Windows\\System32',
	);
	GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes('/\0/');
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L88
test('GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes_Unix', () => {
	GetFileInfoReturnsNotFoundFileInfoForIllegalPathWithLeadingSlashes('/\0/');
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
test('GetFileInfoReturnsNonExistentFileInfoForIllegalPath', () => {
	function GetFileInfoReturnsNonExistentFileInfoForIllegalPath(
		path: string,
	): void {
		using(new PhysicalFileProvider(getTempPath()), (provider) => {
			const info = provider.getFileInfoSync(path);
			expect(info.existsSync()).toBe(false);
		});
	}

	for (const path of invalidPaths) {
		GetFileInfoReturnsNonExistentFileInfoForIllegalPath(path);
	}
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L179
/* FIXME: test('GetFileInfoReturnsNotFoundFileInfoForAbsolutePath', () => {
	using(new PhysicalFileProvider(getTempPath()), (provider) => {
		const info = provider.getFileInfoSync(
			combinePaths(getTempPath(), randomUUID()),
		);
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
}); */

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L189
/* FIXME: test('GetFileInfoReturnsNotFoundFileInfoForRelativePathAboveRootPath', () => {
	using(new PhysicalFileProvider(getTempPath()), (provider) => {
		const info = provider.getFileInfoSync(
			combinePaths('..', randomUUID()),
		);
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
}); */

// TODO

function InvalidPath_DoesNotThrowGeneric_GetFileInfo(path: string): void {
	using(new PhysicalFileProvider(cwd()), (provider) => {
		const info = provider.getFileInfoSync(path);
		expect(info).not.toBeUndefined();
		expect(info).toBeInstanceOf(NotFoundFileInfo);
	});
}

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L513
test('InvalidPath_DoesNotThrowWindows_GetFileInfo', () => {
	InvalidPath_DoesNotThrowGeneric_GetFileInfo('/test:test');
	InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir/name"');
	InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir>/name');
});

// https://github.com/dotnet/runtime/blob/632f2cd18ac052eb2b4b89cb595221fd4b59a4f4/src/libraries/Microsoft.Extensions.FileProviders.Physical/tests/PhysicalFileProviderTests.cs#L523
test('InvalidPath_DoesNotThrowUnix_GetFileInfo', () => {
	InvalidPath_DoesNotThrowGeneric_GetFileInfo('/test:test\0');
	InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir/\0name"');
	InvalidPath_DoesNotThrowGeneric_GetFileInfo('/dir>/name\0');
});

// TODO
