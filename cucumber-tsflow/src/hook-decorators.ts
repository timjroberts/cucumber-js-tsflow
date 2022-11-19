import { BindingRegistry } from "./binding-registry";
import { Callsite } from "./our-callsite";
import { StepBinding, StepBindingFlags } from "./step-binding";
import { normalizeTag } from "./tag-normalization";

type HookOptions = {
  tag?: string,
  timeout?: number,
}

function overloadedOption(tag?: string | HookOptions): HookOptions {
  if (tag === undefined || typeof tag === 'string') return {tag};

  return tag;
}

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param tagOrOption An optional tag or hook options object.
 */
export function before(tagOrOption?: string | HookOptions): MethodDecorator {
  const callsite = Callsite.capture();

  const {tag, timeout} = overloadedOption(tagOrOption);

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
      tag: normalizeTag(tag),
      callsite: callsite,
      timeout: timeout
    };

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}

/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param tagOrOption An optional tag or hook options object.
 */
export function after(tagOrOption?: string | HookOptions): MethodDecorator {
  const callsite = Callsite.capture();

  const {tag, timeout} = overloadedOption(tagOrOption);

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
      tag: normalizeTag(tag),
      callsite: callsite,
      timeout: timeout
    };

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}
