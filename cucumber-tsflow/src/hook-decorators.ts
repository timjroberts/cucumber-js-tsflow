import {
  IDefineTestCaseHookOptions,
  IDefineTestRunHookOptions,
  IDefineTestStepHookOptions
} from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { BindingRegistry } from "./binding-registry";
import { Callsite } from "./our-callsite";
import { StepBinding, StepBindingFlags } from "./step-binding";
import { normalizeTag } from "./tag-normalization";

// Replace `tags` with `tag` for backwards compatibility
type HookOptions = Omit<IDefineTestCaseHookOptions, 'tags'> & {
  tag?: string,
};

function overloadedOption(tag?: string | HookOptions): HookOptions {
  if (tag === undefined || typeof tag === "string") {
    return { tag };
  }

  return tag
}

function createHookDecorator(
  flag: StepBindingFlags,
  tagOrOption?: string | HookOptions
): MethodDecorator {
  const callsite = Callsite.capture(2);

  const { tag, timeout, ...hookOptions } = overloadedOption(tagOrOption);

  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const stepBinding: StepBinding = {
      stepPattern: "",
      bindingType: flag,
      targetPrototype: target,
      targetPropertyKey: propertyKey,
      argsLength: target[propertyKey].length,
      tag: normalizeTag(tag),
      callsite: callsite,
      timeout: timeout,
      hookOptions: hookOptions,
    };

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param tagOrOption An optional tag or hook options object.
 */
export function before(tagOrOption?: string | HookOptions): MethodDecorator {
  return createHookDecorator(StepBindingFlags.before, tagOrOption);
}

/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param tagOrOption An optional tag or hook options object.
 */
export function after(tagOrOption?: string | HookOptions): MethodDecorator {
  return createHookDecorator(StepBindingFlags.after, tagOrOption);
}

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param options Optional hook options object.
 */
export function beforeAll(options?: IDefineTestRunHookOptions): MethodDecorator {
  return createHookDecorator(StepBindingFlags.beforeAll, options);
}

/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param options Optional hook options object.
 */
export function afterAll(options?: IDefineTestRunHookOptions): MethodDecorator {
  return createHookDecorator(StepBindingFlags.afterAll, options);
}

/**
 * A method decorator that marks the associated function as a 'Before Step' step. The function is
 * executed before each step.
 *
 * @param options Optional hook options object.
 */
export function beforeStep(options?: IDefineTestStepHookOptions): MethodDecorator {
  return createHookDecorator(StepBindingFlags.beforeStep, options);
}

/**
 * A method decorator that marks the associated function as an 'After Step' step. The function is
 * executed after each step.
 *
 * @param options Optional hook options object.
 */
export function afterStep(options?: IDefineTestStepHookOptions): MethodDecorator {
  return createHookDecorator(StepBindingFlags.afterStep, options);
}
