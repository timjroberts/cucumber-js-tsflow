"use strict";

import * as _ from "underscore";

import { ContextType } from "./Types";
import { StepBinding, StepBindingFlags } from "./StepBinding";
import { BindingRegistry, DEFAULT_STEP_PATTERN, DEFAULT_TAG } from "./BindingRegistry";
import { ManagedScenarioContext, ScenarioContext } from "./ScenarioContext";

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
                    bindStepDefinition(this, stepBinding);
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
 */
var ensureSystemBindings = _.once(function (cucumber: any): void {
    cucumber.Before(function (scenario: any) {
        this["__SCENARIO_CONTEXT"] = new ManagedScenarioContext(scenario.getName(),
                                                                _.map(scenario.getTags(), (tag: any) => tag.getName()));;
    });
    
    cucumber.After(function () {
        let scenarioContext = <ManagedScenarioContext>this["__SCENARIO_CONTEXT"];
        
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
    if (stepBinding.meta.stepPatternBound) return;
    
    let bindingFunc = function(): any {
        let bindingRegistry = BindingRegistry.instance;
        
        let scenarioContext = <ManagedScenarioContext>this["__SCENARIO_CONTEXT"];
        
        let matchingStepBindings = bindingRegistry.getStepBindings(stepBinding.stepPattern.toString(),
                                                                   scenarioContext.scenarioInfo.tags);
        
        if (matchingStepBindings.length === 0) {
            // Missing step definition
            return
        }
        else if (matchingStepBindings.length > 1) {
            // Ambigous step definitions
            return;    
        }
        
        let contextTypes = bindingRegistry.getContextTypesForTarget(matchingStepBindings[0].targetPrototype);
        let bindingObject = scenarioContext.getOrActivateBindingClass(matchingStepBindings[0].targetPrototype, contextTypes);
        
        bindingObject._worldObj = this;
        
        return (<Function>bindingObject[stepBinding.targetPropertyKey]).apply(bindingObject, arguments);
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
    
    stepBinding.meta.stepPatternBound = true;
}


/**
 * Binds a hook to Cucumber.
 * 
 * @param cucumber The cucumber object.
 * @param stepBinding The [[StepBinding]] that represents a 'before', or 'after', step definition.
 */
function bindHook(cucumber: any, stepBinding: StepBinding): void {
    let bindingFunc = function(): any {
        let scenarioContext = <ManagedScenarioContext>this["__SCENARIO_CONTEXT"];
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
