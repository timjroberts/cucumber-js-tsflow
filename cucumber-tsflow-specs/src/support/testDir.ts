import assert from "assert";
import fs, { ReadStream, WriteStream } from "fs";
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

  public readFileStream(
    ...pathParts: string[] | [string[]]
  ): ReadStream | null {
    const filePath = this.getPath(...pathParts);

    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath, { encoding: "utf-8" });
    }

    return null;
  }

  public writeFileStream(...pathParts: string[] | [string[]]): WriteStream {
    const filePath = this.getPath(...pathParts);

    return fs.createWriteStream(filePath, { encoding: "utf-8" });
  }

  public readFile(...pathParts: string[] | [string[]]): string | null {
    const filePath = this.getPath(...pathParts);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, { encoding: "utf-8" });
    }

    return null;
  }

  public writeFile(pathParts: string | string[], data: string): void {
    const pathArgs = (
      typeof pathParts === "string" ? [pathParts] : pathParts
    ).flatMap((part) => part.split("/"));

    if (pathArgs.length > 1) {
      this.mkdir(pathArgs.slice(0, pathArgs.length - 1));
    }

    const filePath = this.getPath(pathArgs);

    fs.writeFileSync(filePath, data, { encoding: "utf-8" });
  }

  public mkdir(...pathParts: string[] | [string[]]): string {
    const dirPath = this.getPath(...pathParts);
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }

  private getPath(...pathParts: string[] | [string[]]): string {
    return path.join(
      this.path,
      ...(pathParts.length === 1 && Array.isArray(pathParts[0])
        ? pathParts[0]
        : (pathParts as string[])),
    );
  }
}
