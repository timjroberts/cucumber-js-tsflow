import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  BeforeStep,
  Given,
  Then,
  When,
  World,
} from "@cucumber/cucumber";
import {
  IDefineStepOptions,
  IDefineTestStepHookOptions,
} from "@cucumber/cucumber/lib/support_code_library_builder/types";
import { PickleTag } from "@cucumber/messages";
import * as _ from "underscore";
import { BindingRegistry, DEFAULT_TAG } from "./binding-registry";
import logger from "./logger";
import {
  ManagedScenarioContext,
  ScenarioContext,
  ScenarioInfo,
} from "./managed-scenario-context";
import {
  CucumberAttachments,
  CucumberLog,
  WorldParameters,
} from "./provided-context";
import { StepBinding, StepBindingFlags } from "./step-binding";
import { ContextType, StepPattern, TypeDecorator } from "./types";

interface WritableWorld extends World {
  [key: string]: any;
}

/**
 * The property name of the current scenario context that will be attached to the Cucumber
 * world object.
 */
const SCENARIO_CONTEXT_SLOTNAME: string = "__SCENARIO_CONTEXT";

/**
 * A set of step patterns that have been registered with Cucumber.
 *
 * In order to support scoped (or tagged) step definitions, we must ensure that any step binding is
 * only registered with Cucumber once. The binding function for that step pattern then becomes
 * responsible for looking up and execuing the step binding based on the context that is in scope at
 * the point of invocation.
 */
const stepPatternRegistrations = new Map<StepPattern, StepBindingFlags>();

// tslint:disable:no-bitwise

function ensureNoCyclicDependencies(target: any, currentPath: any[] = []) {
  const dependencies = BindingRegistry.instance.getContextTypesForTarget(target.prototype);

  if (dependencies.length === 0) {
    return;
  }

  for (const dependency of dependencies) {
    if (dependency === undefined) {
      throw new Error(
          `Undefined dependency detected in ${target.name}. You possibly have an import cycle.\n`
          + 'See https://nodejs.org/api/modules.html#modules_cycles'
      );
    }

    if (currentPath.includes(dependency)) {
      throw new Error(`Cyclic dependency detected: ${dependency.name} -> ${target.name} -> ${currentPath.map((t) => t.name).join(' -> ')}`);
    }

    ensureNoCyclicDependencies(dependency, [...currentPath, target]);
  }
}

/**
 * A class decorator that marks the associated class as a CucumberJS binding.
 *
 * @param requiredContextTypes An optional array of Types that will be created and passed into the created
 * object for each scenario.
 *
 * An instance of the decorated class will be created for each scenario.
 */
export function binding(requiredContextTypes?: ContextType[]): TypeDecorator {
  return <T>(target: new (...args: any[]) => T) => {
    ensureSystemBindings();
    const bindingRegistry = BindingRegistry.instance;
    bindingRegistry.registerContextTypesForTarget(
      target.prototype,
      requiredContextTypes
    );

    ensureNoCyclicDependencies(target);

    const allBindings: StepBinding[] = [
      ...bindingRegistry.getStepBindingsForTarget(target),
      ...bindingRegistry.getStepBindingsForTarget(target.prototype),
    ];

    for (const stepBinding of allBindings) {
      if (stepBinding.bindingType & StepBindingFlags.StepDefinitions) {
        let stepBindingFlags = stepPatternRegistrations.get(
          stepBinding.stepPattern.toString()
        );

        if (stepBindingFlags === undefined) {
          stepBindingFlags = StepBindingFlags.none;
        }

        if (stepBindingFlags & stepBinding.bindingType) {
          return;
        }

        const bound = bindStepDefinition(stepBinding);

        if (bound) {
          stepPatternRegistrations.set(
            stepBinding.stepPattern.toString(),
            stepBindingFlags | stepBinding.bindingType
          );
        }
      } else if (stepBinding.bindingType & StepBindingFlags.Hooks) {
        bindHook(stepBinding);
      } else {
        logger.trace("Ignored binding", stepBinding);
      }
    }
  };
}

function getContextFromWorld(world: World): ScenarioContext {
    const context: unknown = (world as Record<string, any>)[SCENARIO_CONTEXT_SLOTNAME];

    if (context instanceof ManagedScenarioContext) {
      return context;
    }

    throw new Error('Scenario context have not been initialized in the provided World object.');
}

export function getBindingFromWorld<T extends ContextType>( world: World, contextType: T): InstanceType<T> {
  const context = getContextFromWorld(world);

  return context.getContextInstance(contextType);
}

export function ensureWorldIsInitialized() {
  ensureSystemBindings();
}

/**
 * Ensures that the 'cucumber-tsflow' hooks are bound to Cucumber.
 *
 * @param cucumber The cucumber object.
 *
 * The hooks will only be registered with Cucumber once regardless of which binding invokes the
 * function.
 */
const ensureSystemBindings = _.once(() => {
  Before(function (this: WritableWorld, scenario) {
    logger.trace(
      "Setting up scenario context for scenario:",
      JSON.stringify(scenario)
    );

    const scenarioInfo = new ScenarioInfo(
      scenario.pickle.name!,
      _.map(scenario.pickle.tags!, (tag: PickleTag) => tag.name!)
    );

    const scenarioContext = new ManagedScenarioContext(scenarioInfo);

    this[SCENARIO_CONTEXT_SLOTNAME] = scenarioContext;

    scenarioContext.addExternalObject(scenarioInfo);
    scenarioContext.addExternalObject(new WorldParameters(this.parameters));
    scenarioContext.addExternalObject(new CucumberLog(this.log?.bind(this)));
    scenarioContext.addExternalObject(
      new CucumberAttachments(this.attach?.bind(this))
    );
  });

  After(function (this: WritableWorld) {
    const scenarioContext = this[
      SCENARIO_CONTEXT_SLOTNAME
    ] as ManagedScenarioContext;

    if (scenarioContext) {
      scenarioContext.dispose();
    }
  });

  try {
    const stackFilter = require("@cucumber/cucumber/lib/filter_stack_trace");
    const path = require("path");

    const originalFileNameFilter = stackFilter.isFileNameInCucumber;

    if (originalFileNameFilter !== undefined) {
      const projectRootPath = path.join(__dirname, "..") + "/";

      Object.defineProperty(stackFilter, "isFileNameInCucumber", {
        value: (fileName: string) =>
          originalFileNameFilter(fileName) ||
          fileName.startsWith(projectRootPath) ||
          fileName.includes("node_modules"),
        configurable: true,
        enumerable: true,
      });
    }
  } catch {
    // Ignore errors, proper stack filtering is not officially supported
    // so we override on a best effor basis only
  }

  // Decorate the Cucumber step definition snippet builder so that it uses our syntax

  // let currentSnippetBuilder = cucumberSys.SupportCode.StepDefinitionSnippetBuilder;

  // cucumberSys.SupportCode.StepDefinitionSnippetBuilder = function (step, syntax) {
  //     return currentSnippetBuilder(step, {
  //         build: function (functionName: string, pattern, parameters, comment) {
  //             let callbackName = parameters[parameters.length - 1];

  //             return `@${functionName.toLowerCase()}(${pattern})\n` +
  //                    `public ${functionName}XXX (${parameters.join(", ")}): void {\n` +
  //                    `  // ${comment}\n` +
  //                    `  ${callbackName}.pending();\n` +
  //                    `}\n`;
  //         }
  //     });
  // }
});

/**
 * Binds a step definition to Cucumber.
 *
 * @param stepBinding The [[StepBinding]] that represents a 'given', 'when', or 'then' step definition.
 */
function bindStepDefinition(stepBinding: StepBinding): boolean {
  const bindingFunc = function (this: WritableWorld): any {
    const bindingRegistry = BindingRegistry.instance;

    const scenarioContext = this[
      SCENARIO_CONTEXT_SLOTNAME
    ] as ManagedScenarioContext;

    const matchingStepBindings = bindingRegistry.getStepBindings(
      stepBinding.stepPattern.toString()
    );

    const contextTypes = bindingRegistry.getContextTypesForTarget(
      matchingStepBindings[0].targetPrototype
    );
    const bindingObject = scenarioContext.getOrActivateBindingClass(
      matchingStepBindings[0].targetPrototype,
      contextTypes
    );

    return (
      bindingObject[matchingStepBindings[0].targetPropertyKey] as () => void
    ).apply(bindingObject, arguments as any);
  };

  Object.defineProperty(bindingFunc, "length", {
    value: stepBinding.argsLength,
  });

  logger.trace("Binding step:", stepBinding);

  const bindingOptions: IDefineStepOptions & IDefineTestStepHookOptions = {
    timeout: stepBinding.timeout,
    wrapperOptions: stepBinding.wrapperOption,
    tags: stepBinding.tag === DEFAULT_TAG ? undefined : stepBinding.tag,
  };

  if (stepBinding.bindingType & StepBindingFlags.given) {
    Given(stepBinding.stepPattern, bindingOptions, bindingFunc);
  } else if (stepBinding.bindingType & StepBindingFlags.when) {
    When(stepBinding.stepPattern, bindingOptions, bindingFunc);
  } else if (stepBinding.bindingType & StepBindingFlags.then) {
    Then(stepBinding.stepPattern, bindingOptions, bindingFunc);
  } else {
    return false;
  }

  return true;
}

/**
 * Binds a hook to Cucumber.
 *
 * @param cucumber The cucumber object.
 * @param stepBinding The [[StepBinding]] that represents a 'before', or 'after', step definition.
 */
function bindHook(stepBinding: StepBinding): void {
  const bindingFunc = function (this: any): any {
    const scenarioContext = this[
      SCENARIO_CONTEXT_SLOTNAME
    ] as ManagedScenarioContext;
    const contextTypes = BindingRegistry.instance.getContextTypesForTarget(
      stepBinding.targetPrototype
    );
    const bindingObject = scenarioContext.getOrActivateBindingClass(
      stepBinding.targetPrototype,
      contextTypes
    );

    return (bindingObject[stepBinding.targetPropertyKey] as () => void).apply(
      bindingObject,
      arguments as any
    );
  };

  const globalBindFunc = () => {
    const targetPrototype = stepBinding.targetPrototype;
    const targetPrototypeKey = stepBinding.targetPropertyKey;

    return targetPrototype[targetPrototypeKey].apply(targetPrototype);
  };

  Object.defineProperty(bindingFunc, "length", {
    value: stepBinding.argsLength,
  });

  const bindingOptions: IDefineTestStepHookOptions = {
    timeout: stepBinding.timeout,
    tags: stepBinding.tag === DEFAULT_TAG ? undefined : stepBinding.tag,
    ...stepBinding.hookOptions ?? {},
  };

  logger.trace("Binding hook:", stepBinding);

  switch (stepBinding.bindingType) {
    case StepBindingFlags.before:
      Before(bindingOptions, bindingFunc);
      break;
    case StepBindingFlags.after:
      After(bindingOptions, bindingFunc);
      break;
    case StepBindingFlags.beforeAll:
      BeforeAll(globalBindFunc);
      break;
    case StepBindingFlags.beforeStep:
      BeforeStep(bindingFunc);
      break;
    case StepBindingFlags.afterStep:
      AfterStep(bindingFunc);
      break;
    case StepBindingFlags.afterAll:
      AfterAll(globalBindFunc);
      break;
  }
}
