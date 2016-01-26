"use strict";

import * as _ from "underscore";

import {BindingRegistry, StepPatternMap, TagMap} from "./BindingRegistry";
import {StepBindingDescriptor, StepBindingFlags} from "./StepBindingDescriptor";
import {BindingError} from "./Errors/BindingError";
import {ScenarioContext, ScenarioInformation} from "./ScenarioContext";


export type ContextType = new () => any;


/**
 * A class decorator that marks the associated class as a CucumberJS binding.
 *
 * @param requiredContextTypes An optional array of Types that will be created an passed into the created
 * object for each scenario.
 *
 * An instance of the decorated class will be created for each scenario.
 */
export function binding(requiredContextTypes?: ContextType[]): ClassDecorator {
    return function (target: Function): Function {
        let newConstructor = function () {
            let bindingRegistry = BindingRegistry.instance;

            bindingRegistry.registerContextTypesForTarget(target.prototype, requiredContextTypes);

            bindingRegistry.ensureSystemBindings(() => {
                // Create a Before scenario handler that sets up a ScenarioContext object and attaches it
                // to the World object
                this.Before(function(scenario, callback) {
                    let scenarioInfo = new ScenarioInformation();

                    (<any>scenarioInfo)._title = scenario.getName();
                    (<any>scenarioInfo)._tags = _.map(scenario.getTags(), (tag: any) => tag.getName());

                    let scenarioCtx = new ScenarioContext();

                    (<any>scenarioCtx)._scenarioInfo = scenarioInfo;
                    (<any>scenarioCtx)._activeCtxObjs = { };

                    this["__SCENARIO_CONTEXT"] = scenarioCtx;

                    callback();
                });
            });

            var stepBindingTypes = bindingRegistry.getBindingPatternsForTarget(target.prototype);

            for (var stepBindingType in stepBindingTypes) {
                var stepBindingTypeValue: StepBindingFlags = StepBindingFlags[<string>stepBindingType];

                if (stepBindingTypeValue & StepBindingFlags.StepDefinitions) {
                    bindStepDefinitions(this, stepBindingTypeValue, stepBindingTypes[stepBindingType])
                }
                else if (stepBindingTypeValue & StepBindingFlags.Hooks) {
                    bindHooks(this, stepBindingTypeValue, stepBindingTypes[stepBindingType]);
                }
            }
        };

        newConstructor.prototype = target.prototype;

        return newConstructor;
    }
}


function bindStepDefinitions(cucumber: any, stepBindingType: StepBindingFlags, stepPatterns: StepPatternMap): void {
    for (var stepPattern in stepPatterns) {
        if (stepPatterns[stepPattern].meta.bound) {
            continue;
        }

        let bindingFunc = function(...args: any[]) {
            let scenarioCtx: ScenarioContext = this["__SCENARIO_CONTEXT"];

            return new Promise<any>((resolve, reject) => {
                let bindingRegistry = BindingRegistry.instance;

                try {
                    let activeStepBinding = bindingRegistry.lookupStepBinding(stepBindingType, stepPattern, scenarioCtx.scenarioInfo.tags);
                    let requiredContextTypes = bindingRegistry.getContextTypesForTarget(activeStepBinding.targetPrototype);
                    let objectInstance = (<any>scenarioCtx).activateBindingObject(activeStepBinding.targetPrototype, requiredContextTypes);

                    objectInstance._worldObj = this;

                    return resolve((<Function>objectInstance[activeStepBinding.targetPropertyKey]).apply(objectInstance, args));
                }
                catch (error) {
                    if (error instanceof BindingError) {
                        return reject(`Binding Error: ${error.message}`);
                    }

                    reject(error.message);
                }
            });
        };

        Object.defineProperty(bindingFunc, "length", { value: <number>stepPatterns[stepPattern].meta.patternArgsLength });

        if (stepBindingType & StepBindingFlags.given) {
            cucumber.Given(stepPatterns[stepPattern].meta.regExpObj, bindingFunc);
        }
        else if (stepBindingType & StepBindingFlags.when) {
            cucumber.When(stepPatterns[stepPattern].meta.regExpObj, bindingFunc);
        }
        else if (stepBindingType & StepBindingFlags.then) {
            cucumber.Then(stepPatterns[stepPattern].meta.regExpObj, bindingFunc);
        }

        stepPatterns[stepPattern].meta.bound = true;
    }
}


function bindHooks(cucumber: any, stepBindingType: StepBindingFlags, stepPatterns: StepPatternMap, requiredContextTypes?: ContextType[]): void {
    for (var stepPattern in stepPatterns) {
        let tags: TagMap = stepPatterns[stepPattern];

        for (var tag in tags) {
            if (tag === "meta") {
                continue;
            }

            let stepBindings: StepBindingDescriptor[] = tags[tag];

            stepBindings.forEach((stepBinding) => {
                let bindingFunc = function(...args: any[]) {
                    let scenarioCtx: ScenarioContext = this["__SCENARIO_CONTEXT"];

                    return new Promise<any>((resolve, reject) => {
                        let bindingRegistry = BindingRegistry.instance;

                        try {
                            let requiredContextTypes = bindingRegistry.getContextTypesForTarget(stepBinding.targetPrototype);
                            let objectInstance = (<any>scenarioCtx).activateBindingObject(stepBinding.targetPrototype, requiredContextTypes);

                            objectInstance._worldObj = this;

                            return resolve((<Function>objectInstance[stepBinding.targetPropertyKey]).apply(objectInstance, args));
                        }
                        catch (error) {
                            reject(error.message);
                        }
                    });
                };

                Object.defineProperty(bindingFunc, "length", { value: stepBinding.argsLength });

                if (stepBindingType & StepBindingFlags.before) {
                    if (stepBinding.tag === "*") {
                        cucumber.Before(bindingFunc);
                    }
                    else {
                        cucumber.Before(stepBinding.tag, bindingFunc);
                    }
                }
                else if (stepBindingType & StepBindingFlags.after) {
                    if (stepBinding.tag === "*") {
                        cucumber.After(bindingFunc);
                    }
                    else {
                        cucumber.After(stepBinding.tag, bindingFunc);
                    }
                }
            });
        }
    }
}
