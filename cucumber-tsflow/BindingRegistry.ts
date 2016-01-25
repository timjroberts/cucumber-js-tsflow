"use strict";

import * as _ from "underscore";

import {StepBindingDescriptor, StepBindingFlags} from "./StepBindingDescriptor";
import {AmbiguousBinding} from "./Errors/AmbiguousBinding";
import {MissingBinding} from "./Errors/MissingBinding";


/**
 * Defines a mapping between a tag name and a [[StepBindingDescriptor]].
 */
export type TagMap = IMetaDictionary<StepBindingDescriptor[]>;

/**
 * Defines a mapping between a step pattern and a [[TagMap]].
 */
export type StepPatternMap = IDictionary<TagMap>;

/**
 * Defines a mapping between a step binding type (i.e., given, when, then) and a [[StepPatternMap]].
 */
export type StepBindingTypeMap = IDictionary<StepPatternMap>;


const UNKNOWN_REGEX_PATTERN: RegExp = /.*/;


/**
 * A metadata registry that captures information about step bindings.
 */
export class BindingRegistry {
    private _globalStepBindings: StepBindingTypeMap = { };
    private _targetStepBindings: IDictionary<StepBindingTypeMap> = { };
    private _hasSystemBindings: boolean = false;

    /**
     * Gets the binding registry singleton.
     *
     * @returns The [[BindingRegistry]] singleton object.
     */
    public static get instance(): BindingRegistry {
        const BINDING_REGISTRY_SLOTNAME: string = "__CUCUMBER_TSFLOW_BINDINGREGISTRY";

        let registry = process[BINDING_REGISTRY_SLOTNAME];

        if (!registry) {
            process[BINDING_REGISTRY_SLOTNAME] = new BindingRegistry();
        }

        return registry || process[BINDING_REGISTRY_SLOTNAME];
    }

    /**
     * Updates the binding registry with a step binding.
     *
     * @param stepBinding The [[StepBindingDescriptor]] to include in the registry.
     */
    public registerStepBinding(stepBinding: StepBindingDescriptor): void {
        if (!stepBinding.tag) {
            stepBinding.tag = "*";
        }

        if (!stepBinding.stepPattern) {
            stepBinding.stepPattern = UNKNOWN_REGEX_PATTERN;
        }

        this.updateStepBindingIndexes(stepBinding);
    }

    /**
     * Retrieves the step bindings for a given type.
     *
     * @param targetPrototype The prototype of the type for which step bindings are required.
     * @returns A [[StepBindingTypeMap]] that defines the step bindings for the specified type.
     */
    public getBindingPatternsForTarget(targetPrototype: any): StepBindingTypeMap {
        return this._targetStepBindings[(<any>targetPrototype.constructor).name];
    }

    /**
     * Looks up a step binding.
     *
     * @param stepBindingType A [[StepBindingFlags]] value.
     * @param stepPattern The step pattern.
     * @param tagsInScope An array of tags that are considered in scope during the lookup.
     * @returns The [[StepBindingDescriptor]] object that was resolved from the supplied parameters.
     *
     * This function can throw a [[MissingBinding]] if no step binding could be found, or a
     * [[AmbiguousBinding]] if more than one step binding was found.
     */
    public lookupStepBinding(stepBindingType: StepBindingFlags, stepPattern: RegExp, tagsInScope: string[]): StepBindingDescriptor {
        let lookupFunc = (tag: string): StepBindingDescriptor[] => {
            let stepPatterns: StepPatternMap = this._globalStepBindings[StepBindingFlags[stepBindingType]];

            if (!stepPatterns) {
                return undefined;
            }

            let tags: TagMap = stepPatterns[stepPattern.toString()];

            if (!tags) {
                return undefined;
            }

            return tags[tag];
        };

        let stepBindings = _.where(_.flatten(_.map(tagsInScope, lookupFunc)), (stepBinding) => stepBinding !== undefined);

        if (stepBindings.length === 0) {
            throw new MissingBinding(stepPattern, tagsInScope);
        }

        if (stepBindings.length > 1) {
            throw new AmbiguousBinding(stepPattern, tagsInScope);
        }

        return stepBindings[0];
    }

    /**
     * A utility function that ensures that the system level bindings have been registered.
     *
     * @param callback A function that returns a promise that once resolved, indicates that the
     * system level bindings have been registered.
     *
     * The supplied callback will only be executed once.
     */
    public ensureSystemBindings(callback: () => Promise<void>): void {
        if (!this._hasSystemBindings) {
            callback().then(() =>
            {
                this._hasSystemBindings = true;
            });
        }
    }

    /**
     * Updates the binding registry's indexes.
     *
     * @param stepBinding The [[StepBindingDescriptor]] from which the indexes will be updated.
     */
    private updateStepBindingIndexes(stepBinding: StepBindingDescriptor): void {
        // Global index
        let stepBindingTypeString = StepBindingFlags[stepBinding.bindingType];

        let stepPatterns: StepPatternMap = this._globalStepBindings[stepBindingTypeString];

        if (!stepPatterns) {
            stepPatterns = { }

            this._globalStepBindings[stepBindingTypeString] = stepPatterns;
        }

        let tags: TagMap = stepPatterns[stepBinding.stepPattern.toString()];

        if (!tags) {
            tags = <TagMap>{ meta: { } };
            tags.meta.bound = false;
            tags.meta.regExpObj = stepBinding.stepPattern;
            tags.meta.patternArgsLength = stepBinding.argsLength;

            stepPatterns[stepBinding.stepPattern.toString()] = tags;
        }

        let stepBindings = tags[stepBinding.tag];

        if (!stepBindings) {
            stepBindings = [ ];

            tags[stepBinding.tag] = stepBindings;
        }

        stepBindings.push(stepBinding);

        // Target index
        let targetStepBindings = this._targetStepBindings[stepBinding.targetPrototype];

        if (!targetStepBindings) {
            targetStepBindings = { };

            this._targetStepBindings[stepBinding.targetPrototype.constructor.name] = targetStepBindings;
        }

        targetStepBindings[stepBindingTypeString] = stepPatterns;
    }
}