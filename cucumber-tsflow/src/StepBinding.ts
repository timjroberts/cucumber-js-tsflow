import { StepBindingFlags } from "./StepBindingFlags";
import { Callsite } from "./Callsite";

/**
 * Encapsulates data about a step binding.
 */
export interface StepBinding {
    /**
     * The step pattern.
     */
    stepPattern: RegExp | string;

    /**
     * The step binding type.
     */
    bindingType: StepBindingFlags;

    /**
     * The type that is associated with the current step binding.
     */
    targetPrototype: any;

    /**
     * The function name that is associated with the current step binding.
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

    /**
     * The optiomal timeout that is associated with the current step binding.
     */
    timeout?: number;

    /**
     * The callsite of the step binding.
     */
    callsite: Callsite;
}

export * from "./StepBindingFlags";
