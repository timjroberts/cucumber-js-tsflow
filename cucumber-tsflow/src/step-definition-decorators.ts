import { BindingRegistry } from "./binding-registry";
import logger from "./logger";
import { Callsite } from "./our-callsite";
import { StepBinding, StepBindingFlags } from "./step-binding";
import { normalizeTag } from "./tag-normalization";

interface StepOptions {
  tag?: string,

  timeout?: number,

  wrapperOption?: any,
}

function overloadedOptions(tag?: string | StepOptions, timeout?: number): StepOptions {
  if (tag === undefined || typeof tag === "string") {
    return { tag, timeout };
  }

  if (timeout !== undefined) {
    throw new Error("Cannot specify a separate timeout argument when an options object is given.");
  }

  return tag;
}

/**
 * A method decorator that marks the associated function as a 'Given' step.
 *
 * @param stepPattern The regular expression that will be used to match steps.
 * @param tag An optional tag or an options object.
 * @param timeout An optional timeout.
 */
export function given(
  stepPattern: RegExp | string,
  tagOrOption?: string | StepOptions,
  timeout?: number
): MethodDecorator {
  const callsite = Callsite.capture();

  const options = overloadedOptions(tagOrOption, timeout);

  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const stepBinding: StepBinding = {
      stepPattern: stepPattern,
      bindingType: StepBindingFlags.given,
      targetPrototype: target,
      targetPropertyKey: propertyKey,
      argsLength: target[propertyKey].length,
      callsite: callsite,
      tag: normalizeTag(options.tag),
      timeout: options.timeout,
      wrapperOption: options.wrapperOption
    };

    logger.trace(
      "Registering step definition:",
      stepBinding
    );

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}

/**
 * A method decorator that marks the associated function as a 'When' step.
 *
 * @param stepPattern The regular expression that will be used to match steps.
 * @param tag An optional tag.
 * @param timeout An optional timeout.
 */
export function when(
  stepPattern: RegExp | string,
  tagOrOption?: string | StepOptions,
  timeout?: number
): MethodDecorator {
  const callsite = Callsite.capture();

  const options = overloadedOptions(tagOrOption, timeout);

  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const stepBinding: StepBinding = {
      stepPattern: stepPattern,
      bindingType: StepBindingFlags.when,
      targetPrototype: target,
      targetPropertyKey: propertyKey,
      argsLength: target[propertyKey].length,
      callsite: callsite,
      tag: normalizeTag(options.tag),
      timeout: options.timeout,
      wrapperOption: options.wrapperOption
    };

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}

/**
 * A method decorator that marks the associated function as a 'Then' step.
 *
 * @param stepPattern The regular expression that will be used to match steps.
 * @param tag An optional tag.
 * @param timeout An optional timeout.
 */
export function then(
  stepPattern: RegExp | string,
  tagOrOption?: string,
  timeout?: number
): MethodDecorator {
  const callsite = Callsite.capture();

  const options = overloadedOptions(tagOrOption, timeout);

  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const stepBinding: StepBinding = {
      stepPattern: stepPattern,
      bindingType: StepBindingFlags.then,
      targetPrototype: target,
      targetPropertyKey: propertyKey,
      argsLength: target[propertyKey].length,
      callsite: callsite,
      tag: normalizeTag(options.tag),
      timeout: options.timeout,
      wrapperOption: options.wrapperOption
    };

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}
