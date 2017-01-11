"use strict";

import * as _ from "underscore";

import { TagName } from "./Types";

/**
 * Provides information about a running Cucumber feature.
 */
export class FeatureInfo {
    /**
     * Initializes the [[FeatureInfo]] object.
     * 
     * @param featureTitle The string title of the currently running Cucumber feature.
     * @param tags An array of [[TagName]] representing the tags that are in scope for the currently
     * running Cucumber feature.
     */
    constructor(public featureTitle: string, public tags: TagName[]) {
    }
}
