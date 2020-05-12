import { BindingRegistry } from "./binding-registry";
import { Callsite } from "./our-callsite";
import { StepBinding, StepBindingFlags } from "./step-binding";

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param tag An optional tag.
 */
export function before(tag?: string): MethodDecorator {
  const callsite = Callsite.capture();

  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const stepBinding: StepBinding = {
      stepPattern: "",
      bindingType: StepBindingFlags.before,
      targetPrototype: target,
      targetPropertyKey: propertyKey,
      argsLength: target[propertyKey].length,
      callsite: callsite
    };

    if (tag) {
      stepBinding.tag = tag;
    }

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}

/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param tag An optional tag.
 */
export function after(tag?: string): MethodDecorator {
  const callsite = Callsite.capture();

  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const stepBinding: StepBinding = {
      stepPattern: "",
      bindingType: StepBindingFlags.after,
      targetPrototype: target,
      targetPropertyKey: propertyKey,
      argsLength: target[propertyKey].length,
      callsite: callsite
    };

    if (tag) {
      stepBinding.tag = tag;
    }

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}
