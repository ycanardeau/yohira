export type IDisposable = Disposable;

export function using<TDisposable extends IDisposable, T>(
	disposable: TDisposable,
	callback: (disposable: TDisposable) => T,
): T {
	try {
		return callback(disposable);
	} finally {
		disposable[Symbol.dispose]();
	}
}
