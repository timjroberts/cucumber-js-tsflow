import { BindingRegistry } from "./BindingRegistry";
import { StepBinding, StepBindingFlags } from "./StepBinding";
import { Callsite } from "./Callsite";

/**
 * A method decorator that marks the associated function as a 'Given' step.
 *
 * @param stepPattern The regular expression that will be used to match steps.
 * @param tag An optional tag.
 * @param timeout An optional timeout.
 */
export function given(stepPattern: RegExp|string, tag?: string, timeout?: number): MethodDecorator {
    let callsite = Callsite.capture();

    return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        let stepBinding: StepBinding = {
            stepPattern: stepPattern,
            bindingType: StepBindingFlags.given,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"],
            callsite: callsite
        };

        if (tag) {
            stepBinding.tag = tag[0] === "@" ? tag : `@${tag}`;
        }

        if (timeout) {
            stepBinding.timeout = timeout;
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
 * @param timeout An optional timeout.
 */
export function when(stepPattern: RegExp|string, tag?: string, timeout?: number): MethodDecorator {
    let callsite = Callsite.capture();

    return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        let stepBinding: StepBinding = {
            stepPattern: stepPattern,
            bindingType: StepBindingFlags.when,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"],
            callsite: callsite
        };

        if (tag) {
            stepBinding.tag = tag[0] === "@" ? tag : `@${tag}`;
        }

        if (timeout) {
            stepBinding.timeout = timeout;
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
 * @param timeout An optional timeout.
 */
export function then(stepPattern: RegExp|string, tag?: string, timeout?: number): MethodDecorator {
    let callsite = Callsite.capture();

    return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        let stepBinding: StepBinding = {
            stepPattern: stepPattern,
            bindingType: StepBindingFlags.then,
            targetPrototype: target,
            targetPropertyKey: propertyKey,
            argsLength: target[propertyKey]["length"],
            callsite: callsite
        };

        if (tag) {
            stepBinding.tag = tag[0] === "@" ? tag : `@${tag}`;
        }

        if (timeout) {
            stepBinding.timeout = timeout;
        }

        BindingRegistry.instance.registerStepBinding(stepBinding);

        return descriptor;
    }
}
