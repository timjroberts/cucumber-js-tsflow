import * as _ from "underscore";

import { ScenarioInfo } from "./ScenarioInfo";

/**
 * Provides context for the currently running Cucumber scenario.
 */
export interface ScenarioContext {
    /**
     * Gets information about the scenario.
     *
     */
    scenarioInfo: ScenarioInfo;
    
    /**
     * Gets or sets an arbitary object within the running scenario.
     */
    [key: string]: any;
}

export * from "./ScenarioInfo";
