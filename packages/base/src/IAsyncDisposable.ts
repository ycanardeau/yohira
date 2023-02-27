export interface IAsyncDisposable {
	disposeAsync(): Promise<void>;
}

export async function usingAsync<T extends IAsyncDisposable>(
	disposable: T,
	action: (disposable: T) => Promise<void>,
): Promise<void> {
	try {
		await action(disposable);
	} finally {
		await disposable.disposeAsync();
	}
}
