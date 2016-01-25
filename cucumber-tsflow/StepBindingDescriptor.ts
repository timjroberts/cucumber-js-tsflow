"use strict";

/**
 * The CucumberJS step binding types.
 */
export enum StepBindingFlags {
    /**
     * A 'Given' step definition binding.
     */
    given = 1 << 0,

    /**
     * A 'When' step definition binding.
     */
    when = 1 << 1,

    /**
     * A 'Then' step definition binding.
     */
    then = 1 << 2,

    /**
     * A 'Before' hook binding.
     */
    before = 1 << 3,

    /**
     * An 'After' hook binding.
     */
    after = 1 << 4,

    /**
     * All step definition bindings.
     */
    StepDefinitions = StepBindingFlags.given | StepBindingFlags.when | StepBindingFlags.then,

    /**
     * All hook bindings.
     */
    Hooks = StepBindingFlags.before | StepBindingFlags.after
}


/**
 * Encapsulates data about a step binding.
 */
export interface StepBindingDescriptor {
    /**
     * The step pattern.
     */
    stepPattern: RegExp;

    /**
     * The step binding type.
     */
    bindingType: StepBindingFlags;

    /**
     * The type that is associated with the current step binding.
     */
    targetPrototype: any;

    /**
     * The function that is associated with the current step binding.
     */
    targetPropertyKey: string | symbol;

    /**
     * The count of arguments that have been specified on the [[StepBindingDescriptor.targetPropertyKey]].
     */
    argsLength: number;

    /**
     * The optional tag that is associated with the current step binding.
     */
    tag?: string;
}
