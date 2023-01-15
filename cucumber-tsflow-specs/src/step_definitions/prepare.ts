import { formatterHelpers, ITestCaseHookParameter } from "@cucumber/cucumber";
import { after, before, binding } from "cucumber-tsflow";
import fsExtra from "fs-extra";
import path from "path";
import { TestRunner } from "../support/runner";

const projectPath = path.join(__dirname, "..", "..", "..");
const projectNodeModulePath = path.join(projectPath, "node_modules");
const cucumberPath = path.join(projectNodeModulePath, "@cucumber", "cucumber");
const tsNodePath = path.join(projectNodeModulePath, "ts-node");
const projectLibPath = path.join(projectPath, "cucumber-tsflow");

@binding([TestRunner])
class Prepare {
  public constructor(private readonly runner: TestRunner) {}

  @before()
  public setupTestDir({ gherkinDocument, pickle }: ITestCaseHookParameter) {
    const { line } = formatterHelpers.PickleParser.getPickleLocation({
      gherkinDocument,
      pickle
    });

    const tmpDir = path.join(
      projectPath,
      "tmp",
      `${path.basename(pickle.uri)}_${line.toString()}`
    );

    fsExtra.removeSync(tmpDir);

    this.runner.dir.path = tmpDir;

    this.setupNodeModules();

    const tags = [
      ...pickle.tags.map(tag => tag.name),
      ...gherkinDocument.feature?.tags.map(tag => tag.name) ?? []
    ];

    this.writeDefaultFiles(tags);
  }

  @after()
  public tearDownTestDir() {
    const { lastRun } = this.runner;

    if (
      lastRun?.error != null &&
      !this.runner.verifiedLastRunError
    ) {
      throw new Error(
        `Last run errored unexpectedly. Output:\n\n${lastRun.output}\n\n` +
        `Error Output:\n\n${lastRun.errorOutput}`
      );
    }
  }

  private setupNodeModules() {
    const tmpDirNodeModulesPath = this.runner.dir.getPath("node_modules");
    fsExtra.mkdirpSync(tmpDirNodeModulesPath);

    fsExtra.ensureSymlinkSync(cucumberPath, path.join(
      tmpDirNodeModulesPath,
      "@cucumber",
      "cucumber"
    ));
    fsExtra.ensureSymlinkSync(tsNodePath, path.join(
      tmpDirNodeModulesPath,
      "ts-node"
    ));
    fsExtra.ensureSymlinkSync(projectLibPath, path.join(
      tmpDirNodeModulesPath,
      "cucumber-tsflow"
    ));
  }

  private writeDefaultFiles(tags: string[]) {

    if (!tags.includes("custom-tsconfig")) {
      fsExtra.outputJsonSync(
        this.runner.dir.getPath("tsconfig.json"),
        {
          compilerOptions: {
            experimentalDecorators: true
          }
        }
      );
    }
  }
}

export = Prepare;
