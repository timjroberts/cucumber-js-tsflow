import { binding, given } from "cucumber-tsflow";
import fsExtra from "fs-extra";
import { TestRunner } from "../support/runner";

@binding([TestRunner])
class FileSteps {
  public constructor(private readonly runner: TestRunner) {}

  @given("a file named {string} with:")
  public async newFile(filePath: string, fileContent: string) {
    await fsExtra.outputFile(this.runner.dir.getPath(filePath), fileContent);
  }

  @given("an empty file named {string}")
  public newEmptyFile(filePath: string) {
    return this.newFile(filePath, "");
  }

  @given("a directory named {string}")
  public async newDir(filePath: string) {
    await fsExtra.mkdirp(this.runner.dir.getPath(filePath));
  }
}

export = FileSteps;

// Given("{string} is an absolute path", function(this: World, filePath: string) {
//   filePath = Mustache.render(filePath, this);
//   expect(path.isAbsolute(filePath)).to.eql(true);
// });
//
// Then(
//   "the file {string} has the text:",
//   async function(this: World, filePath: string, text: string) {
//     filePath = Mustache.render(filePath, this);
//     const absoluteFilePath = path.resolve(this.tmpDir, filePath);
//     const content = await fs.readFile(absoluteFilePath, "utf8");
//     const actualContent = normalizeText(content);
//     const expectedContent = normalizeText(text);
//     expect(actualContent).to.eql(expectedContent);
//   }
// );
