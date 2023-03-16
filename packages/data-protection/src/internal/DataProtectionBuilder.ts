import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

import { IDataProtectionBuilder } from '../IDataProtectionBuilder';

export class DataProtectionBuilder implements IDataProtectionBuilder {
	constructor(readonly services: IServiceCollection) {}
}
