import { Callsite } from "./our-callsite";
import {
  appendStepBindingMetadata,
  StepBindingFlags,
  type StepBindingMetadata,
} from "./step-binding";
import { normalizeTag } from "./tag-normalization";
import type { StepDecorator } from "./types";

interface IDefineTestCaseHookOptions {
  name?: string;
  tags?: string;
  timeout?: number;
}

interface IDefineTestRunHookOptions {
  name?: string;
  timeout?: number;
}

interface IDefineTestStepHookOptions {
  tags?: string;
  timeout?: number;
}

// Replace `tags` with `tag` for backwards compatibility
type HookOptions = Omit<IDefineTestCaseHookOptions, "tags"> & {
  tag?: string;
};

function overloadedOption(tag?: string | HookOptions): HookOptions {
  if (tag === undefined || typeof tag === "string") {
    return { tag };
  }

  return tag;
}

function createHookDecorator(
  flag: StepBindingFlags,
  tagOrOption?: string | HookOptions,
): StepDecorator {
  const callsite = Callsite.capture(2);

  const { tag, timeout, ...hookOptions } = overloadedOption(tagOrOption);

  return (value: Function, context: ClassMethodDecoratorContext) => {
    if (context.private) {
      throw new Error(
        `Cannot register private method ${String(context.name)} as a Cucumber hook.`,
      );
    }

    const stepBinding: StepBindingMetadata = {
      stepPattern: "",
      bindingType: flag,
      targetPropertyKey: context.name,
      argsLength: value.length,
      tag: normalizeTag(tag),
      callsite: callsite,
      timeout: timeout,
      hookOptions: hookOptions,
    };

    appendStepBindingMetadata(value, stepBinding);
  };
}

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param tagOrOption An optional tag or hook options object.
 */
export function before(tagOrOption?: string | HookOptions): StepDecorator {
  return createHookDecorator(StepBindingFlags.before, tagOrOption);
}

/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param tagOrOption An optional tag or hook options object.
 */
export function after(tagOrOption?: string | HookOptions): StepDecorator {
  return createHookDecorator(StepBindingFlags.after, tagOrOption);
}

/**
 * A method decorator that marks the associated function as a 'Before Scenario' step. The function is
 * executed before each scenario.
 *
 * @param options Optional hook options object.
 */
export function beforeAll(options?: IDefineTestRunHookOptions): StepDecorator {
  return createHookDecorator(StepBindingFlags.beforeAll, options);
}

/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param options Optional hook options object.
 */
export function afterAll(options?: IDefineTestRunHookOptions): StepDecorator {
  return createHookDecorator(StepBindingFlags.afterAll, options);
}

/**
 * A method decorator that marks the associated function as a 'Before Step' step. The function is
 * executed before each step.
 *
 * @param options Optional hook options object.
 */
export function beforeStep(
  options?: IDefineTestStepHookOptions,
): StepDecorator {
  return createHookDecorator(StepBindingFlags.beforeStep, options);
}

/**
 * A method decorator that marks the associated function as an 'After Step' step. The function is
 * executed after each step.
 *
 * @param options Optional hook options object.
 */
export function afterStep(options?: IDefineTestStepHookOptions): StepDecorator {
  return createHookDecorator(StepBindingFlags.afterStep, options);
}
