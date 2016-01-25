/**
 * Represents a step binding error.
 */
export abstract class BindingError extends Error {
    /**
     * Initializes the base [[BindingError]] object.
     *
     * @param message A user displayable message.
     * @param stepPattern The [[RegExp]] that represents the failing step pattern.
     * @param tagsInScope An array of tags that are currently in scope.
     */
    constructor(message: string, stepPattern: RegExp, tagsInScope: string[]) {
        super();

        this.message = message;
    }
}
