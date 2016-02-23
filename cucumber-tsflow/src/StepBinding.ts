"use strict";

import { StepBindingFlags } from "./StepBindingFlags";

/**
 * Encapsulates data about a step binding.
 */
export interface StepBinding {
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
     * Additional metadata that can be attached to the step binding.
     */
    meta?: any;
}

export * from "./StepBindingFlags";
