import { Callsite } from "./our-callsite";
import { StepBindingFlags } from "./step-binding-flags";

/**
 * Encapsulates data about a step binding.
 */
export interface StepBinding {
  /**
   * The step pattern.
   */
  stepPattern: RegExp | string;

  /**
   * The step binding type.
   */
  bindingType: StepBindingFlags;

  /**
   * The type that is associated with the current step binding.
   */
  targetPrototype: any;

  /**
   * The function name that is associated with the current step binding.
   */
  targetPropertyKey: string | symbol;

  /**
   * The count of arguments that have been specified on the [[StepBindingDescriptor.targetPropertyKey]].
   */
  argsLength: number;

  /**
   * The optional tag that is associated with the current step binding.
   */
  tag?: string;

  /**
   * The optiomal timeout that is associated with the current step binding.
   */
  timeout?: number;

  /**
   * The wrapper Option passing to cucumber
   */
  wrapperOption?: any;

  hookOptions?: Record<string, any>;

  /**
   * The callsite of the step binding.
   */
  callsite: Callsite;
}

export type StepBindingMetadata = Omit<StepBinding, "targetPrototype">;

const STEP_BINDINGS = Symbol("cucumber-tsflow.stepBindings");

interface StepBindingMetadataTarget extends Function {
  [STEP_BINDINGS]?: StepBindingMetadata[];
}

export function appendStepBindingMetadata(
  value: Function,
  stepBinding: StepBindingMetadata,
): void {
  const target = value as StepBindingMetadataTarget;
  const stepBindings = target[STEP_BINDINGS] ?? [];
  stepBindings.push(stepBinding);
  target[STEP_BINDINGS] = stepBindings;
}

export function getStepBindingMetadata(
  value: Function,
): readonly StepBindingMetadata[] {
  return (value as StepBindingMetadataTarget)[STEP_BINDINGS] ?? [];
}

export * from "./step-binding-flags";
