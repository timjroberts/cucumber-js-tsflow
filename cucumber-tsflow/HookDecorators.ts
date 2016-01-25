"use strict";

import {BindingRegistry} from "./BindingRegistry";
import {StepBindingDescriptor, StepBindingFlags} from "./StepBindingDescriptor";

/**
 *
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
