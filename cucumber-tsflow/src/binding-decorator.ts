import * as _ from "underscore";
import { Tag, Given, When, Then, Before, After } from "cucumber";

import { ContextType, StepPattern } from "./Types";
import { StepBinding, StepBindingFlags } from "./step-binding";
import { BindingRegistry, DEFAULT_TAG } from "./binding-registry";
import { ManagedScenarioContext } from "./managed-scenario-context";


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
export function binding(requiredContextTypes?: ContextType[]) {
    return function <T>(target: { new(): T }) {
        ensureSystemBindings();
        let bindingRegistry = BindingRegistry.instance;
        bindingRegistry.registerContextTypesForTarget(target.prototype, requiredContextTypes);
        bindingRegistry.getStepBindingsForTarget(target.prototype).forEach((stepBinding) => {
            if (stepBinding.bindingType & StepBindingFlags.StepDefinitions) {
                let stepBindingFlags = stepPatternRegistrations.get(stepBinding.stepPattern.toString());
                if (stepBindingFlags === undefined) {
                    stepBindingFlags = StepBindingFlags.none;
                }
                if (stepBindingFlags & stepBinding.bindingType)
                    return;
                bindStepDefinition(stepBinding);
                stepPatternRegistrations.set(stepBinding.stepPattern.toString(), stepBindingFlags | stepBinding.bindingType);
            }
            else if (stepBinding.bindingType & StepBindingFlags.Hooks) {
                bindHook(stepBinding);
            }
        });
        return target;
    };
}

/**
 * Ensures that the 'cucumber-tsflow' hooks are bound to Cucumber.
 *
 * @param cucumber The cucumber object.
 *
 * The hooks will only be registered with Cucumber once regardless of which binding invokes the
 * function.
 */
var ensureSystemBindings = _.once(() => {
    Before(function (scenario: any) {
        this[SCENARIO_CONTEXT_SLOTNAME] = new ManagedScenarioContext(scenario.name, _.map(scenario.tags, (tag: Tag) => tag.name));
    });

    After(function () {
        let scenarioContext = <ManagedScenarioContext>this[SCENARIO_CONTEXT_SLOTNAME];

        if (scenarioContext) {
            scenarioContext.dispose();
        }
    });

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
 * @param cucumber The cucumber object.
 * @param stepBinding The [[StepBinding]] that represents a 'given', 'when', or 'then' step definition.
 */
function bindStepDefinition(stepBinding: StepBinding): void {
    let bindingFunc = function (this: any): any {
        let bindingRegistry = BindingRegistry.instance;

        let scenarioContext = <ManagedScenarioContext>this[SCENARIO_CONTEXT_SLOTNAME];

        let matchingStepBindings = bindingRegistry.getStepBindings(stepBinding.stepPattern.toString(),
            scenarioContext.scenarioInfo.tags);

        if (matchingStepBindings.length > 1) {
            let message = `Ambiguous step definitions for '${matchingStepBindings[0].stepPattern}':\n`;

            matchingStepBindings.forEach((matchingStepBinding) => {
                message = message + `\t\t${String(matchingStepBinding.targetPropertyKey)} (${matchingStepBinding.callsite.toString()})\n`;
            });

            return new Error(message);
        }

        let contextTypes = bindingRegistry.getContextTypesForTarget(matchingStepBindings[0].targetPrototype);
        let bindingObject = scenarioContext.getOrActivateBindingClass(matchingStepBindings[0].targetPrototype, contextTypes);

        bindingObject._worldObj = this;

        return (<Function>bindingObject[matchingStepBindings[0].targetPropertyKey]).apply(bindingObject, arguments);
    };

    Object.defineProperty(bindingFunc, "length", { value: stepBinding.argsLength });

    if (stepBinding.bindingType & StepBindingFlags.given) {
        if (stepBinding.timeout) {
            Given(stepBinding.stepPattern, { timeout: stepBinding.timeout }, bindingFunc);
        }
        else {
            Given(stepBinding.stepPattern, bindingFunc);
        }
    }
    else if (stepBinding.bindingType & StepBindingFlags.when) {
        if (stepBinding.timeout) {
            When(stepBinding.stepPattern, { timeout: stepBinding.timeout }, bindingFunc);
        }
        else {
            When(stepBinding.stepPattern, bindingFunc);
        }
    }
    else if (stepBinding.bindingType & StepBindingFlags.then) {
        if (stepBinding.timeout) {
            Then(stepBinding.stepPattern, { timeout: stepBinding.timeout }, bindingFunc);
        }
        else {
            Then(stepBinding.stepPattern, bindingFunc);
        }
    }
}


/**
 * Binds a hook to Cucumber.
 *
 * @param cucumber The cucumber object.
 * @param stepBinding The [[StepBinding]] that represents a 'before', or 'after', step definition.
 */
function bindHook(stepBinding: StepBinding): void {
    let bindingFunc = function (this: any): any {
        let scenarioContext = <ManagedScenarioContext>this[SCENARIO_CONTEXT_SLOTNAME];
        let contextTypes = BindingRegistry.instance.getContextTypesForTarget(stepBinding.targetPrototype);
        let bindingObject = scenarioContext.getOrActivateBindingClass(stepBinding.targetPrototype, contextTypes);

        bindingObject._worldObj = this;

        return (<Function>bindingObject[stepBinding.targetPropertyKey]).apply(bindingObject, arguments);
    };

    Object.defineProperty(bindingFunc, "length", { value: stepBinding.argsLength });

    if (stepBinding.bindingType & StepBindingFlags.before) {
        if (stepBinding.tag === DEFAULT_TAG) {
            Before(bindingFunc);
        }
        else {
            Before(String(stepBinding.tag), bindingFunc);
        }
    }
    else if (stepBinding.bindingType & StepBindingFlags.after) {
        if (stepBinding.tag === DEFAULT_TAG) {
            After(bindingFunc);
        }
        else {
            After(String(stepBinding.tag), bindingFunc);
        }
    }
}
