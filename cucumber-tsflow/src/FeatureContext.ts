"use strict";

import * as _ from "underscore";

import { FeatureInfo } from "./FeatureInfo";

/**
 * Provides context for the currently running Cucumber feature.
 */
export interface FeatureContext {
    /**
     * Gets information about the feature.
     *
     */
    FeatureInfo: FeatureInfo;
    
    /**
     * Gets or sets an arbitary object within the running feature.
     */
    [key: string]: any;
}

export * from "./FeatureInfo";
