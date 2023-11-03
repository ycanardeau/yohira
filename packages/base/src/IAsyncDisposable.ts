export type IAsyncDisposable = AsyncDisposable;

export async function usingAsync<TDisposable extends IAsyncDisposable, T>(
	disposable: TDisposable,
	callback: (disposable: TDisposable) => Promise<T>,
): Promise<T> {
	try {
		return await callback(disposable);
	} finally {
		await disposable[Symbol.asyncDispose]();
	}
}
