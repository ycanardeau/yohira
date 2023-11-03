export async function usingAsync<TDisposable extends AsyncDisposable, T>(
	disposable: TDisposable,
	callback: (disposable: TDisposable) => Promise<T>,
): Promise<T> {
	try {
		return await callback(disposable);
	} finally {
		await disposable[Symbol.asyncDispose]();
	}
}
