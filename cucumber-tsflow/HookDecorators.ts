"use strict";

import {BindingRegistry} from "./BindingRegistry";
import {StepBindingDescriptor, StepBindingFlags} from "./StepBindingDescriptor";

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param tag An optional tag.
 */
export function before(tag?: string): MethodDecorator {
    return function(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
        let stepBinding: StepBindingDescriptor = {
            stepPattern: undefined,
            bindingType: StepBindingFlags.before,
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
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param tag An optional tag.
 */
export function after(tag?: string): MethodDecorator {
    return function(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
        let stepBinding: StepBindingDescriptor = {
            stepPattern: undefined,
            bindingType: StepBindingFlags.after,
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
