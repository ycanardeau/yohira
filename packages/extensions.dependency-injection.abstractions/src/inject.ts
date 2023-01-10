import { Type } from '@yohira/base/Type';
import { DecoratorTarget } from '@yohira/third-party.inversify/annotation/decorator_utils';
import { injectBase } from '@yohira/third-party.inversify/annotation/inject_base';
import * as METADATA_KEY from '@yohira/third-party.inversify/constants/metadata_keys';

export const inject = (
	serviceType: Type,
): ((
	target: DecoratorTarget<unknown>,
	targetKey?: string | symbol,
	indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<any>,
) => void) => {
	return injectBase(METADATA_KEY.INJECT_TAG)(serviceType.value);
};
