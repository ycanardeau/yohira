import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/EmptyResult.cs,4a61328fe53815dc,references
/**
 * Represents an {@link ActionResult} that when executed will
 * do nothing.
 */
export class EmptyResult extends ActionResult {
	executeResultSync(context: ActionContext): void {}
}
