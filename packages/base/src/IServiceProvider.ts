import { Type } from '@yohira/base/Type';

// https://source.dot.net/#System.ComponentModel/System/IServiceProvider.cs,03aa8a3a87219ddd,references
export interface IServiceProvider {
	getService<T>(serviceType: Type): T | undefined;
}
