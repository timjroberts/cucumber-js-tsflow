"use strict";

export interface WorkspaceInfo {
    path: string;
    
    disposeFunc: Function;
}

export class TypeScriptWorkspace {
    private _workspace: WorkspaceInfo;
    
    public setWorkspace(workspace: WorkspaceInfo): void {
        this._workspace = workspace;
    }
    
    public dispose(): void {
        if (!this._workspace) return;
        
        console.log(`Deleting temporary workspace '${this._workspace.path}'`);
        
        this._workspace.disposeFunc();
    }
}
