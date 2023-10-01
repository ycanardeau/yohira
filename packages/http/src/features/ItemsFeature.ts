import { IItemsFeature } from '@yohira/http.features';

export class ItemsFeature implements IItemsFeature {
	items: Map<unknown, unknown>;

	constructor() {
		this.items = new Map /* TODO: ItemsDictionary */();
	}
}
