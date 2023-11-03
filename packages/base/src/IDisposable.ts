export function using<TDisposable extends Disposable, T>(
	disposable: TDisposable,
	callback: (disposable: TDisposable) => T,
): T {
	try {
		return callback(disposable);
	} finally {
		disposable[Symbol.dispose]();
	}
}
