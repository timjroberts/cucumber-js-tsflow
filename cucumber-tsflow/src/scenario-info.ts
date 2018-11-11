import * as _ from "underscore";

import { TagName } from "./types";

/**
 * Provides information about a running Cucumber scenario.
 */
export class ScenarioInfo {
  /**
   * Initializes the [[ScenarioInfo]] object.
   *
   * @param scenarioTitle The string title of the currently running Cucumber scenario.
   * @param tags An array of [[TagName]] representing the tags that are in scope for the currently
   * running Cucumber scenario.
   */
  constructor(public scenarioTitle: string, public tags: TagName[]) {}
}
