"use strict";

import { BindingRegistry } from "./BindingRegistry";
import { StepBinding, StepBindingFlags } from "./StepBinding";

/**
 * A method decorator that marks the associated function as a 'Given' step.
 *
 * @param stepPattern The regular expression that will be used to match steps.
 * @param tag An optional tag.
 */
export function given(stepPattern: RegExp, tag?: string): MethodDecorator {
    return function(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any | Promise<any>>) {
        let stepBinding: StepBinding = {
            stepPattern: stepPattern,
            bindingType: StepBindingFlags.given,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"]
        };

        if (tag) {
            stepBinding.tag = tag;
        }

        BindingRegistry.instance.registerStepBinding(stepBinding)

        return descriptor;
    }
}


/**
 * A method decorator that marks the associated function as a 'When' step.
 *
 * @param stepPattern The regular expression that will be used to match steps.
 * @param tag An optional tag.
 */
export function when(stepPattern: RegExp, tag?: string): MethodDecorator {
    return function(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any | Promise<any>>) {
        let stepBinding: StepBinding = {
            stepPattern: stepPattern,
            bindingType: StepBindingFlags.when,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"]
        };

        if (tag) {
            stepBinding.tag = tag;
        }

        BindingRegistry.instance.registerStepBinding(stepBinding);

        return descriptor;
    }
}


/**
 * A method decorator that marks the associated function as a 'Then' step.
 *
 * @param stepPattern The regular expression that will be used to match steps.
 * @param tag An optional tag.
 */
export function then(stepPattern: RegExp, tag?: string): MethodDecorator {
    return function(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any | Promise<any>>) {
        let stepBinding: StepBinding = {
            stepPattern: stepPattern,
            bindingType: StepBindingFlags.then,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"]
        };

        if (tag) {
            stepBinding.tag = tag;
        }

        BindingRegistry.instance.registerStepBinding(stepBinding);

        return descriptor;
    }
}
