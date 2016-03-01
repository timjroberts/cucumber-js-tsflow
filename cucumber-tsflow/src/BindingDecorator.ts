"use strict";

import * as _ from "underscore";

import { ContextType, StepPattern } from "./Types";
import { StepBinding, StepBindingFlags } from "./StepBinding";
import { BindingRegistry, DEFAULT_STEP_PATTERN, DEFAULT_TAG } from "./BindingRegistry";
import { ManagedScenarioContext, ScenarioContext } from "./ManagedScenarioContext";

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
var stepPatternRegistrations = new Map<StepPattern, StepBindingFlags>();


/**
 * A class decorator that marks the associated class as a CucumberJS binding.
 *
 * @param requiredContextTypes An optional array of Types that will be created and passed into the created
 * object for each scenario.
 *
 * An instance of the decorated class will be created for each scenario.
 */
export function binding(requiredContextTypes?: ContextType[]): ClassDecorator {
    return function(target: Function): Function {
        let newConstructor = function() {
            ensureSystemBindings(this);

            let bindingRegistry = BindingRegistry.instance;

            bindingRegistry.registerContextTypesForTarget(target.prototype, requiredContextTypes);

            bindingRegistry.getStepBindingsForTarget(target.prototype).forEach((stepBinding: StepBinding) => {
                if (stepBinding.bindingType & StepBindingFlags.StepDefinitions) {
                    let stepBindingFlags = stepPatternRegistrations.get(stepBinding.stepPattern.toString());

                    if (stepBindingFlags === undefined) {
                        stepBindingFlags = 0;
                    }

                    if (stepBindingFlags & stepBinding.bindingType) return;

                    bindStepDefinition(this, stepBinding);

                    stepPatternRegistrations.set(stepBinding.stepPattern.toString(), stepBindingFlags | stepBinding.bindingType);
                }
                else if (stepBinding.bindingType & StepBindingFlags.Hooks) {
                    bindHook(this, stepBinding);
                }
            });
        }

        newConstructor.prototype = target.prototype;

        return newConstructor;
    }
}


/**
 * Ensures that the 'cucumber-tsflow' hooks are bound to Cucumber.
 *
 * @param cucumber The cucumber object.
 *
 * The hooks will only be registered with Cucumber once regardless of which binding invokes the
 * function.
 */
var ensureSystemBindings = _.once(function (cucumber: any): void {
    cucumber.Before(function (scenario: any) {
        this[SCENARIO_CONTEXT_SLOTNAME] = new ManagedScenarioContext(scenario.getName(), _.map(scenario.getTags(), (tag: any) => tag.getName()));;
    });

    cucumber.After(function () {
        let scenarioContext = <ManagedScenarioContext>this[SCENARIO_CONTEXT_SLOTNAME];

        if (scenarioContext) {
            scenarioContext.dispose();
        }
    });
});


/**
 * Binds a step definition to Cucumber.
 *
 * @param cucumber The cucumber object.
 * @param stepBinding The [[StepBinding]] that represents a 'given', 'when', or 'then' step definition.
 */
function bindStepDefinition(cucumber: any, stepBinding: StepBinding): void {
    let bindingFunc = function(): any {
        let bindingRegistry = BindingRegistry.instance;

        let scenarioContext = <ManagedScenarioContext>this[SCENARIO_CONTEXT_SLOTNAME];

        let matchingStepBindings = bindingRegistry.getStepBindings(stepBinding.stepPattern.toString(),
                                                                   scenarioContext.scenarioInfo.tags);

        if (matchingStepBindings.length === 0) {
            throw new Error(`Missing step definition for '${stepBinding.stepPattern.toString()}'.`);
        }
        else if (matchingStepBindings.length > 1) {
            throw generateAmbiguousStepBindingsError(matchingStepBindings);
        }

        let contextTypes = bindingRegistry.getContextTypesForTarget(matchingStepBindings[0].targetPrototype);
        let bindingObject = scenarioContext.getOrActivateBindingClass(matchingStepBindings[0].targetPrototype, contextTypes);

        bindingObject._worldObj = this;

        return (<Function>bindingObject[matchingStepBindings[0].targetPropertyKey]).apply(bindingObject, arguments);
    };

    Object.defineProperty(bindingFunc, "length", { value: stepBinding.argsLength });

    if (stepBinding.bindingType & StepBindingFlags.given) {
        cucumber.Given(stepBinding.stepPattern, bindingFunc);
    }
    else if (stepBinding.bindingType & StepBindingFlags.when) {
        cucumber.When(stepBinding.stepPattern, bindingFunc);
    }
    else if (stepBinding.bindingType & StepBindingFlags.then) {
        cucumber.Then(stepBinding.stepPattern, bindingFunc);
    }
}


/**
 * Binds a hook to Cucumber.
 *
 * @param cucumber The cucumber object.
 * @param stepBinding The [[StepBinding]] that represents a 'before', or 'after', step definition.
 */
function bindHook(cucumber: any, stepBinding: StepBinding): void {
    let bindingFunc = function(): any {
        let scenarioContext = <ManagedScenarioContext>this[SCENARIO_CONTEXT_SLOTNAME];
        let contextTypes = BindingRegistry.instance.getContextTypesForTarget(stepBinding.targetPrototype);
        let bindingObject = scenarioContext.getOrActivateBindingClass(stepBinding.targetPrototype, contextTypes);

        bindingObject._worldObj = this;

        return (<Function>bindingObject[stepBinding.targetPropertyKey]).apply(bindingObject, arguments);
    };

    Object.defineProperty(bindingFunc, "length", { value: stepBinding.argsLength });

    if (stepBinding.bindingType & StepBindingFlags.before) {
        if (stepBinding.tag === DEFAULT_TAG) {
            cucumber.Before(bindingFunc);
        }
        else {
            cucumber.Before(stepBinding.tag, bindingFunc);
        }
    }
    else if (stepBinding.bindingType & StepBindingFlags.after) {
        if (stepBinding.tag === DEFAULT_TAG) {
            cucumber.After(bindingFunc);
        }
        else {
            cucumber.After(stepBinding.tag, bindingFunc);
        }
    }
}


/**
 * Generates an ambiguous step binding error from an array of matching step bindings.
 *
 * @param matchingStepBindings The array of [[StepBinding]] objects.
 *
 * @returns An [[Error]] with a message that has been created from the supplied step bindings.
 */
function generateAmbiguousStepBindingsError(matchingStepBindings: StepBinding[]): Error {
    let message = `Ambiguous step definitions for '${matchingStepBindings[0].stepPattern}':\n`;

    matchingStepBindings.forEach((matchingStepBinding) => {
        message = message + `\t\t${matchingStepBinding.targetPropertyKey} (${matchingStepBinding.callsite.toString()})\n`;
    });

    return new Error(message);
}