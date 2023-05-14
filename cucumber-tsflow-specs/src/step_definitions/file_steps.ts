import { binding, given } from "cucumber-tsflow";
import { TestRunner } from "../support/runner";

@binding([TestRunner])
class FileSteps {
  public constructor(private readonly runner: TestRunner) {}

  @given("a file named {string} with:")
  public newFile(filePath: string, fileContent: string) {
    this.runner.dir.writeFile(filePath, fileContent);
  }

  @given("an empty file named {string}")
  public newEmptyFile(filePath: string) {
    return this.newFile(filePath, "");
  }

  @given("a directory named {string}")
  public async newDir(filePath: string) {
    this.runner.dir.mkdir(filePath);
  }
}

export = FileSteps;
