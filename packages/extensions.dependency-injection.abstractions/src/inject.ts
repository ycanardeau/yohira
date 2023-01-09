import { Type } from '@yohira/base/Type';
import { inject as inversifyInject } from 'inversify';
import { DecoratorTarget } from 'inversify/lib/annotation/decorator_utils';

export const inject = (
	serviceType: Type,
): ((
	target: DecoratorTarget<unknown>,
	targetKey?: string | symbol,
	indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<any>,
) => void) => {
	return inversifyInject(serviceType.value);
};
