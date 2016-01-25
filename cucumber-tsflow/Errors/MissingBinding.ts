import {BindingError} from "./BindingError";

/**
 * Represents an error that is thrown when a step binding cannot resolve to any
 * step definitions.
 */
export class MissingBinding extends BindingError {
    /**
     * Initializes a new [[MissingBinding]] object.
     *
     * @param stepPattern The [[RegExp]] that represents the failing step pattern.
     * @param tagsInScope An array of tags that are currently in scope.
     */
    constructor(stepPattern: RegExp, tagsInScope: string[]) {
        super(`Step '${stepPattern}' has not resolved to a step definition.`, stepPattern, tagsInScope);
    }
}
