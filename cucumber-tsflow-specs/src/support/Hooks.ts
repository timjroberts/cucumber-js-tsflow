"use strict";

import * as tmp from "tmp";
import { binding, before } from "cucumber-tsflow";

import { TypeScriptWorkspace, WorkspaceInfo } from "./TypeScriptWorkspace";

@binding([TypeScriptWorkspace])
class Hooks {
    constructor(protected workspace: TypeScriptWorkspace) {
    }

    @before("foo")
    public async beforeScenario(): Promise<void> {
        let tempDirInfo = await this.createTemporaryDirectoryAsync();

        console.log(`Created temporary workspace '${tempDirInfo.path}'`);

        this.workspace.setWorkspace(tempDirInfo);
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
