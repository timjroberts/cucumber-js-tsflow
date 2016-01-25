import {BindingError} from "./BindingError";

/**
 * Represents an error that is thrown when a step binding resolves to more than one
 * step definition.
 */
export class AmbiguousBinding extends BindingError {
    /**
     * Initializes a new [[AmbiguousBinding]] object.
     *
     * @param stepPattern The [[RegExp]] that represents the failing step pattern.
     * @param tagsInScope An array of tags that are currently in scope.
     */
    constructor(stepPattern: RegExp, tagsInScope: string[]) {
        super(`Step '${stepPattern}' has resolved to more than one step definition.`, stepPattern, tagsInScope);
    }
}
