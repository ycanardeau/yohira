import {
	DecoratorTarget,
	createTaggedDecorator,
} from '@yohira/third-party.inversify/annotation/decorator_utils';
import { ServiceIdentifierOrFunc } from '@yohira/third-party.inversify/annotation/lazy_service_identifier';
import { UNDEFINED_INJECT_ANNOTATION } from '@yohira/third-party.inversify/constants/error_msgs';
import { Metadata } from '@yohira/third-party.inversify/planning/metadata';

export function injectBase(metadataKey: string) {
	return <T = unknown>(serviceIdentifier: ServiceIdentifierOrFunc<T>) => {
		return (
			target: DecoratorTarget,
			targetKey?: string | symbol,
			indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>,
		): void => {
			if (serviceIdentifier === undefined) {
				const className =
					typeof target === 'function'
						? target.name
						: target.constructor.name;

				throw new Error(UNDEFINED_INJECT_ANNOTATION(className));
			}
			return createTaggedDecorator(
				new Metadata(metadataKey, serviceIdentifier),
			)(target, targetKey, indexOrPropertyDescriptor);
		};
	};
}
