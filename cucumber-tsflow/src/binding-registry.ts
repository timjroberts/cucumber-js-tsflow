import * as _ from "underscore";

import { StepPattern, TagName, ContextType } from "./types";
import { StepBinding } from "./step-binding";

/**
 * Describes the binding metadata that is associated with a binding class.
 */
type TargetBinding = {
  /**
   * A reference to the step bindings that are associated with the binding class.
   */
  stepBindings: StepBinding[];

  /**
   * The context types that are to be injected into the binding class during execution.
   */
  contextTypes: ContextType[];
};

/**
 * Represents the default step pattern.
 */
export const DEFAULT_STEP_PATTERN: string = "/.*/";

/**
 * Represents the default tag.
 */
export const DEFAULT_TAG: string = "*";

/**
 * A metadata registry that captures information about bindings and their bound step bindings.
 */
export class BindingRegistry {
  private _bindings = new Map<StepPattern, Map<TagName, StepBinding[]>>();
  private _targetBindings = new Map<any, TargetBinding>();

  /**
   * Gets the binding registry singleton.
   *
   * @returns A [[BindingRegistry]].
   */
  public static get instance(): BindingRegistry {
    const BINDING_REGISTRY_SLOTNAME: string =
      "__CUCUMBER_TSFLOW_BINDINGREGISTRY";

    let registry = (global as any)[BINDING_REGISTRY_SLOTNAME];

    if (!registry) {
      (global as any)[BINDING_REGISTRY_SLOTNAME] = new BindingRegistry();
    }

    return registry || (global as any)[BINDING_REGISTRY_SLOTNAME];
  }

  /**
   * Updates the binding registry with information about the context types required by a
   * binding class.
   *
   * @param targetPrototype The class representing the binding (constructor function).
   * @param contextTypes An array of [[ContextType]] that define the types of objects that
   * should be injected into the binding class during a scenario execution.
   */
  public registerContextTypesForTarget(
    targetPrototype: any,
    contextTypes?: ContextType[]
  ): void {
    if (!contextTypes) return;

    let targetDecorations = this._targetBindings.get(targetPrototype);

    if (!targetDecorations) {
      targetDecorations = {
        stepBindings: [],
        contextTypes: []
      };

      this._targetBindings.set(targetPrototype, targetDecorations);
    }

    targetDecorations.contextTypes = contextTypes;
  }

  /**
   * Retrieves the context types that have been registered for a given binding class.
   *
   * @param targetPrototype The class representing the binding (constructor function).
   *
   * @returns An array of [[ContextType]] that have been registered for the specified
   * binding class.
   */
  public getContextTypesForTarget(targetPrototype: any): ContextType[] {
    let targetBinding = this._targetBindings.get(targetPrototype);

    if (!targetBinding) return [];

    return targetBinding.contextTypes;
  }

  /**
   * Updates the binding registry indexes with a step binding.
   *
   * @param stepBinding The step binding that is to be registered with the binding registry.
   */
  public registerStepBinding(stepBinding: StepBinding): void {
    if (!stepBinding.tag) {
      stepBinding.tag = DEFAULT_TAG;
    }

    let stepPattern: StepPattern = stepBinding.stepPattern
      ? stepBinding.stepPattern.toString()
      : DEFAULT_STEP_PATTERN;

    let tagMap = this._bindings.get(stepPattern);

    if (!tagMap) {
      tagMap = new Map<TagName, StepBinding[]>();

      this._bindings.set(stepPattern, tagMap);
    }

    let stepBindings = tagMap.get(stepBinding.tag);

    if (!stepBindings) {
      stepBindings = [];

      tagMap.set(stepBinding.tag, stepBindings);
    }

    stepBindings.push(stepBinding);

    // Index the step binding for the target

    let targetBinding = this._targetBindings.get(stepBinding.targetPrototype);

    if (!targetBinding) {
      targetBinding = {
        stepBindings: [],
        contextTypes: []
      };

      this._targetBindings.set(stepBinding.targetPrototype, targetBinding);
    }

    targetBinding.stepBindings.push(stepBinding);
  }

  /**
   * Retrieves the step bindings that have been registered for a given binding class.
   *
   * @param targetPrototype The class representing the binding (constructor function).
   *
   * @returns An array of [[StepBinding]] objects that have been registered for the specified
   * binding class.
   */
  public getStepBindingsForTarget(targetPrototype: any): StepBinding[] {
    let targetBinding = this._targetBindings.get(targetPrototype);

    if (!targetBinding) return [];

    return targetBinding.stepBindings;
  }

  /**
   * Retrieves the step bindings for a given step pattern and collection of tag names.
   *
   * @param stepPattern The step pattern to search.
   * @param tags An array of [[TagName]] to search.
   *
   * @returns An array of [[StepBinding]] that map to the given step pattern and set of tag names.
   */
  public getStepBindings(
    stepPattern: StepPattern,
    tags: TagName[]
  ): StepBinding[] {
    let tagMap = this._bindings.get(stepPattern);

    if (!tagMap) return [];

    let matchingStepBindings = this.mapTagNamesToStepBindings(tags, tagMap);

    if (matchingStepBindings.length > 0) return matchingStepBindings;

    return this.mapTagNamesToStepBindings(["*"], tagMap);
  }

  /**
   * Maps an array of tag names to an array of associated step bindings.
   *
   * @param tags An array of [[TagName]].
   * @param tagMap The map of [[TagName]] -> [[StepBinding]] to use when mapping.
   *
   * @returns An array of [[StepBinding]].
   */
  private mapTagNamesToStepBindings(
    tags: TagName[],
    tagMap: Map<TagName, StepBinding[]>
  ): StepBinding[] {
    let matchingStepBindings: StepBinding[] = _.flatten(
      _.map(tags, tag => tagMap.get(tag))
    );

    return _.reject(
      matchingStepBindings,
      stepBinding => stepBinding === undefined
    );
  }
}
