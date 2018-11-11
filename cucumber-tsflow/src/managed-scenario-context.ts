import * as _ from "underscore";

import { ScenarioContext, ScenarioInfo } from "./scenario-context";
import { ContextType } from "./types";

/**
 * Represents a [[ScenarioContext]] implementation that manages a collection of context objects that
 * are created and used by binding classes during a running Cucumber scenario.
 */
export class ManagedScenarioContext implements ScenarioContext {
  private _scenarioInfo: ScenarioInfo;
  private _activeObjects = new Map<any, any>();

  constructor(scenarioTitle: string, tags: string[]) {
    this._scenarioInfo = new ScenarioInfo(scenarioTitle, tags);
  }

  /**
   * Gets information about the scenario.
   *
   */
  public get scenarioInfo(): ScenarioInfo {
    return this._scenarioInfo;
  }

  public getOrActivateBindingClass(
    targetPrototype: any,
    contextTypes: ContextType[]
  ): any {
    return this.getOrActivateObject(targetPrototype, () => {
      return this.activateBindingClass(targetPrototype, contextTypes);
    });
  }

  public dispose(): void {
    this._activeObjects.forEach((value: any) => {
      if (typeof value.dispose === "function") {
        value.dispose();
      }
    });
  }

  private activateBindingClass(
    targetPrototype: any,
    contextTypes: ContextType[]
  ): any {
    const invokeBindingConstructor = (args: any[]): any => {
      switch (contextTypes.length) {
        case 0:
          return new (targetPrototype.constructor as any)();
        case 1:
          return new (targetPrototype.constructor as any)(args[0]);
        case 2:
          return new (targetPrototype.constructor as any)(args[0], args[1]);
        case 3:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2]
          );
        case 4:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2],
            args[3]
          );
        case 5:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4]
          );
        case 6:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5]
          );
        case 7:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6]
          );
        case 8:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6],
            args[7]
          );
        case 9:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6],
            args[7],
            args[8]
          );
        case 10:
          return new (targetPrototype.constructor as any)(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6],
            args[7],
            args[8],
            args[9]
          );
      }
    };

    const contextObjects = _.map(contextTypes, contextType =>
      this.getOrActivateObject(contextType.prototype, () => {
        return new contextType();
      })
    );

    return invokeBindingConstructor(contextObjects);
  }

  private getOrActivateObject(
    targetPrototype: any,
    activatorFunc: (...args: any[]) => any
  ): any {
    let activeObject = this._activeObjects.get(targetPrototype);

    if (activeObject) {
      return activeObject;
    }

    activeObject = activatorFunc();

    this._activeObjects.set(targetPrototype, activeObject);

    return activeObject;
  }
}

export * from "./scenario-context";
