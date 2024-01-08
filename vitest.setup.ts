// TODO: remove
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html
(Symbol as any).dispose ??= Symbol('Symbol.dispose');
(Symbol as any).asyncDispose ??= Symbol('Symbol.asyncDispose');
