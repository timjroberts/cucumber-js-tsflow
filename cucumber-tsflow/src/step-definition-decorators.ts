import { Callsite } from "./our-callsite";
import {
  appendStepBindingMetadata,
  StepBindingFlags,
  type StepBindingMetadata,
} from "./step-binding";
import { normalizeTag } from "./tag-normalization";
import type { StepDecorator } from "./types";

interface StepOptions {
  tag?: string;

  timeout?: number;

  wrapperOption?: any;
}

function overloadedOptions(
  tag?: string | StepOptions,
  timeout?: number,
): StepOptions {
  if (tag === undefined || typeof tag === "string") {
    return { tag, timeout };
  }

  if (timeout !== undefined) {
    throw new Error(
      "Cannot specify a separate timeout argument when an options object is given.",
    );
  }

  return tag;
}

function createStepDefinitionDecorator(
  stepPattern: RegExp | string,
  bindingType: StepBindingFlags,
  tagOrOption?: string | StepOptions,
  timeout?: number,
): StepDecorator {
  const callsite = Callsite.capture();
  const options = overloadedOptions(tagOrOption, timeout);

  return (value: Function, context: ClassMethodDecoratorContext) => {
    if (context.private) {
      throw new Error(
        `Cannot register private method ${String(context.name)} as a Cucumber step definition.`,
      );
    }

    const stepBinding: StepBindingMetadata = {
      stepPattern: stepPattern,
      bindingType: bindingType,
      targetPropertyKey: context.name,
      argsLength: value.length,
      callsite: callsite,
      tag: normalizeTag(options.tag),
      timeout: options.timeout,
      wrapperOption: options.wrapperOption,
    };

    appendStepBindingMetadata(value, stepBinding);
  };
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
  timeout?: number,
): StepDecorator {
  return createStepDefinitionDecorator(
    stepPattern,
    StepBindingFlags.given,
    tagOrOption,
    timeout,
  );
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
  timeout?: number,
): StepDecorator {
  return createStepDefinitionDecorator(
    stepPattern,
    StepBindingFlags.when,
    tagOrOption,
    timeout,
  );
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
  tagOrOption?: string | StepOptions,
  timeout?: number,
): StepDecorator {
  return createStepDefinitionDecorator(
    stepPattern,
    StepBindingFlags.then,
    tagOrOption,
    timeout,
  );
}
