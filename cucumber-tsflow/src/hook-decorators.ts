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
  return createDecoratorFactory(StepBindingFlags.before, tag);
}

/**
 * A method decorator that marks the associated function as a 'Before All Scenario' step. The function is
 * executed before all scenarios are executed.
 *
 * @param tag An optional tag.
 */
export function beforeAll(tag?: string): MethodDecorator {
  return createDecoratorFactory(StepBindingFlags.beforeAll, tag);
}

/**
 * A method decorator that marks the associated function as an 'After Scenario' step. The function is
 * executed after each scenario.
 *
 * @param tag An optional tag.
 */
export function after(tag?: string): MethodDecorator {
  return createDecoratorFactory(StepBindingFlags.after, tag);
}

/**
 * A method decorator that marks the associated function as an 'After All Scenario' step. The function is
 * executed after all scenarios are executed.
 *
 * @param tag An optional tag.
 */
export function afterAll(tag?: string): MethodDecorator {
  return createDecoratorFactory(StepBindingFlags.afterAll, tag);
}

function checkTag(tag: string): string {
  return tag;
}

function createDecoratorFactory(flag: StepBindingFlags, tag?: string) {
  const callSite = Callsite.capture();

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
      callsite: callSite
    };

    if (tag) {
      stepBinding.tag = checkTag(tag);
    }

    BindingRegistry.instance.registerStepBinding(stepBinding);

    return descriptor;
  };
}
