"use strict";

import { BindingRegistry } from "./BindingRegistry";
import { StepBinding, StepBindingFlags } from "./StepBinding";
import { Callsite } from "./Callsite";

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param tag An optional tag.
 */
export function before(tag?: string): MethodDecorator {
    let callsite = Callsite.capture();

    return function(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any | Promise<any>>) {
        let stepBinding: StepBinding = {
            stepPattern: undefined,
            bindingType: StepBindingFlags.before,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"],
            callsite: callsite
        };

        if (tag) {
            stepBinding.tag = tag[0] === "@" ? tag : `@${tag}`;
        }

        BindingRegistry.instance.registerStepBinding(stepBinding)

        return descriptor;
    }
}


/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param tag An optional tag.
 */
export function after(tag?: string): MethodDecorator {
    let callsite = Callsite.capture();

    return function(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any | Promise<any>>) {
        let stepBinding: StepBinding = {
            stepPattern: undefined,
            bindingType: StepBindingFlags.before,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"],
            callsite: callsite
        };

        if (tag) {
            stepBinding.tag = tag[0] === "@" ? tag : `@${tag}`;
        }

        BindingRegistry.instance.registerStepBinding(stepBinding)

        return descriptor;
    }
}
