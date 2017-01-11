"use strict";

import * as tmp from "tmp";
import { binding, before, afterFeature, beforeFeature, ScenarioInfo, FeatureInfo } from "cucumber-tsflow";

import { TypeScriptWorkspace, WorkspaceInfo } from "./TypeScriptWorkspace";


@binding([TypeScriptWorkspace])
class Hooks {

    featureInfo: FeatureInfo;
    scenarioInfo: ScenarioInfo;

    constructor(protected workspace: TypeScriptWorkspace) {
    }
    
    @before()
    public async beforeScenario(): Promise<void> {
        let tempDirInfo = await this.createTemporaryDirectoryAsync();
        
        console.log(`Before Scenario Hook: "${this.scenarioInfo.scenarioTitle}"`);

        this.scenarioInfo.tags.forEach(tag =>
        {
            console.log(`\tScenario tag: "${tag}"`);
        });

        console.log(`Created temporary workspace '${tempDirInfo.path}'`);        
        this.workspace.setWorkspace(tempDirInfo);
    }

    @beforeFeature()
    public async beforeFeature(): Promise<void> {

        console.log(`Before Feature Hook: ${this.featureInfo.featureTitle}`);     
        this.featureInfo.tags.forEach(tag =>
        {
            console.log(`\tFeature tag:${tag}`);
        });           
    }

    @afterFeature()
    public async afterFeature(): Promise<void> {

        console.log(`After Feature Hook: ${this.featureInfo.featureTitle}`);     
        this.featureInfo.tags.forEach(tag =>
        {
            console.log(`\tFeature tag:${tag}`);
        });           
    }
    
    
    /**
     * An asynchronous wrapper around tmp.dir().
     */
    private async createTemporaryDirectoryAsync(): Promise<WorkspaceInfo> {
        return new Promise<WorkspaceInfo>((resolve, reject) => {
            tmp.dir({ unsafeCleanup: true }, (error, path, cleanupAction) => {
                if (error) reject(error);

                resolve({ path: path, disposeFunc: cleanupAction });
            });
        });
    }   
}

export = Hooks;
