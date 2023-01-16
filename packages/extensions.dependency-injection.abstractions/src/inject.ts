import { Type } from '@yohira/base';
import {
	DecoratorTarget,
	METADATA_KEY,
	injectBase,
} from '@yohira/third-party.inversify';

export function inject(
	serviceType: Type,
): (
	target: DecoratorTarget<unknown>,
	targetKey?: string | symbol,
	indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<any>,
) => void {
	return injectBase(METADATA_KEY.INJECT_TAG)(serviceType.value);
}
