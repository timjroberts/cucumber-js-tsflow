import assert from "assert";
import path from "path";

export class TestDir {
  private _path?: string;

  public get path(): string {
    assert(this._path, "Test directory not configured");
    return this._path;
  }

  public set path(newPath: string) {
    this._path = newPath;
  }

  public getPath(...pathParts: string[]): string {
    return path.join(this.path, ...pathParts);
  }
}