import * as _ from "underscore";

import {ScenarioInformation} from "./ScenarioInformation";

/**
 * Represents the currently running scenario.
 */
export class ScenarioContext {
    private _scenarioInfo: ScenarioInformation;
    private _activeCtxObjs: IDictionary<any>;

    /**
     * Gets information about the running scenario.
     *
     * @returns A [[ScenarioInformation]] object that describes the running scenario.
     */
    public get scenarioInfo(): ScenarioInformation {
        return this._scenarioInfo;
    }

    /**
     * Activates a Binding object for the running scenario (called internally when a step binding is about
     * to be executed).
     *
     * @param targetPrototype The Binding type that should be activated.
     * @param contextTypes The context types that are required by the target Binding type.
     *
     * @returns The activate Binding object.
     */
    private activateBindingObject(targetPrototype: any, contextTypes?: Array<new () => any>): any {
        contextTypes = contextTypes || [ ];

        let invokeBindingConstructor = (args: any[]): any => {
            switch (contextTypes.length) {
                case 0:  return new (<any>targetPrototype.constructor)();
                case 1:  return new (<any>targetPrototype.constructor)(args[0]);
                case 2:  return new (<any>targetPrototype.constructor)(args[0], args[1]);
                case 3:  return new (<any>targetPrototype.constructor)(args[0], args[1], args[2]);
                case 4:  return new (<any>targetPrototype.constructor)(args[0], args[1], args[2], args[3]);
                case 5:  return new (<any>targetPrototype.constructor)(args[0], args[1], args[2], args[3], args[4]);
                case 6:  return new (<any>targetPrototype.constructor)(args[0], args[1], args[2], args[3], args[4], args[5]);
                case 7:  return new (<any>targetPrototype.constructor)(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                case 8:  return new (<any>targetPrototype.constructor)(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
                case 9:  return new (<any>targetPrototype.constructor)(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
                case 10: return new (<any>targetPrototype.constructor)(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
            }
        };

        let ctxObj = this._activeCtxObjs[(<any>targetPrototype.constructor).name];

        if (!ctxObj) {
            ctxObj = invokeBindingConstructor(this.activateContextObjects(contextTypes));

            this._activeCtxObjs[(<any>targetPrototype.constructor).name] = ctxObj;
        }

        return ctxObj;
    }

    /**
     * Activates a collection of context objects that are required by Binding objects.
     *
     * @param targetPrototypes The types of context objects that are required.
     *
     * @returns An array of activated context objects.
     */
    private activateContextObjects(targetPrototypes: Array<new () => any>): any[] {
        let mappingFunc = (classType: any): any => {
            let ctxObj = this._activeCtxObjs[classType.prototype.constructor.name];

            if (!ctxObj) {
                ctxObj = new classType();

                this._activeCtxObjs[classType.prototype.constructor.name] = ctxObj;
            }

            return ctxObj;
        }

        return _.map(targetPrototypes, mappingFunc);
    }
}

export {ScenarioInformation} from "./ScenarioInformation";
