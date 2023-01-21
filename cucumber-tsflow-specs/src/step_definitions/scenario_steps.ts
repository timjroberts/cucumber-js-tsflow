import { DataTable } from "@cucumber/cucumber";
import * as messages from "@cucumber/messages";
import { binding, then } from "cucumber-tsflow";
import expect from "expect";
import { Extractor } from "../support/helpers";
import { TestRunner } from "../support/runner";

const ENCODING_MAP: { [key: string]: messages.AttachmentContentEncoding } = {
  IDENTITY: messages.AttachmentContentEncoding.IDENTITY,
  BASE64: messages.AttachmentContentEncoding.BASE64
};

@binding([TestRunner])
class ScenarioSteps {
  public constructor(private readonly runner: TestRunner) {}

  @then("it runs {int} scenarios")
  public checkScenarioCount(expectedCount: number) {
    const startedTestCases = this.runner.lastRun.envelopes.reduce(
      (acc, e) => e.testCaseStarted == null
        ? acc
        : acc + 1,
      0
    );

    expect(startedTestCases).toBe(expectedCount);
  }

  @then("it runs the scenario {string}")
  public checkRunSingleScenario(scenario: string) {
    const actualNames = this.runner.extractor.getPickleNamesInOrderOfExecution();
    expect(actualNames).toEqual([scenario]);
  }

  @then("it runs the scenarios:")
  public checkScenarios(table: DataTable) {
    const expectedNames = table.rows().map(row => row[0]);
    const actualNames = this.runner.extractor.getPickleNamesInOrderOfExecution();
    expect(actualNames).toEqual(expectedNames);
  }

  @then("scenario {string} has status {string}")
  public checkScenarioStatus(name: string, status: string) {
    const result = this.runner.extractor.getTestCaseResult(name);

    expect(result.status).toEqual(status.toUpperCase());
  }

  @then("scenario {string} step {string} has the attachments:")
  public checkStepAttachment(
    pickleName: string,
    stepText: string,
    table: DataTable
  ) {
    const expectedAttachments = table.hashes().map((x) => {
      return {
        body: x.DATA,
        mediaType: x["MEDIA TYPE"],
        contentEncoding: ENCODING_MAP[x["MEDIA ENCODING"]]
      };
    });

    const actualAttachments = this.runner.extractor.getAttachmentsForStep(
      pickleName,
      stepText
    )
      .map(Extractor.simplifyAttachment);

    expect(actualAttachments).toEqual(expectedAttachments);
  }

  @then("scenario {string} {string} hook has the attachments:")
  public checkHookAttachment(
    pickleName: string,
    hookKeyword: string,
    table: DataTable
  ) {
    const expectedAttachments: messages.Attachment[] = table
      .hashes()
      .map((x) => {
        return {
          body: x.DATA,
          mediaType: x["MEDIA TYPE"],
          contentEncoding: ENCODING_MAP[x["MEDIA ENCODING"]]
        };
      });

    const actualAttachments = this.runner.extractor
      .getAttachmentsForHook(
        pickleName,
        hookKeyword === "Before"
      )
      .map(Extractor.simplifyAttachment);

    expect(actualAttachments).toEqual(expectedAttachments);
  }

  @then("scenario {string} step {string} has the logs:")
  public checkStepLogs(pickleName: string, stepName: string, logs: DataTable) {
    const expectedLogs = logs.raw().map(row => row[0]);
    const actualLogs = Extractor.logsFromAttachments(
      this.runner.extractor.getAttachmentsForStep(
        pickleName,
        stepName
      )
    );

    expect(actualLogs).toStrictEqual(expectedLogs);
  }

  @then("scenario {string} step {string} has no attachments")
  public checkNoStepLogs(pickleName: string, stepName: string) {
    const attachments = this.runner.extractor.getAttachmentsForStep(
      pickleName,
      stepName
    );

    expect(attachments).toStrictEqual([]);
  }
}

export = ScenarioSteps

// Then(
//   "the scenario {string} has the steps:",
//   function(this: World, name: string, table: DataTable) {
//     const actualTexts = getTestStepResults(this.lastRun.envelopes, name).map(
//       (s) => s.text
//     );
//     const expectedTexts = table.rows().map((row) => row[0]);
//     expect(actualTexts).to.eql(expectedTexts);
//   }
// );
//
// Then(
//   "scenario {string} step {string} has status {string}",
//   function(this: World, pickleName: string, stepText: string, status: string) {
//     const testStepResults = getTestStepResults(
//       this.lastRun.envelopes,
//       pickleName
//     );
//     const testStepResult = testStepResults.find((x) => x.text === stepText);
//     expect(testStepResult.result.status).to.eql(
//       status.toUpperCase() as messages.TestStepResultStatus
//     );
//   }
// );
//
// Then(
//   "scenario {string} attempt {int} step {string} has status {string}",
//   function(
//     this: World,
//     pickleName: string,
//     attempt: number,
//     stepText: string,
//     status: string
//   ) {
//     const testStepResults = getTestStepResults(
//       this.lastRun.envelopes,
//       pickleName,
//       attempt
//     );
//     const testStepResult = testStepResults.find((x) => x.text === stepText);
//     expect(testStepResult.result.status).to.eql(
//       status.toUpperCase() as messages.TestStepResultStatus
//     );
//   }
// );
//
// Then(
//   "scenario {string} {string} hook has status {string}",
//   function(
//     this: World,
//     pickleName: string,
//     hookKeyword: string,
//     status: string
//   ) {
//     const testStepResults = getTestStepResults(
//       this.lastRun.envelopes,
//       pickleName
//     );
//     const testStepResult = testStepResults.find((x) => x.text === hookKeyword);
//     expect(testStepResult.result.status).to.eql(
//       status.toUpperCase() as messages.TestStepResultStatus
//     );
//   }
// );
//
// Then(
//   "scenario {string} step {string} failed with:",
//   function(
//     this: World,
//     pickleName: string,
//     stepText: string,
//     errorMessage: string
//   ) {
//     const testStepResults = getTestStepResults(
//       this.lastRun.envelopes,
//       pickleName
//     );
//     const testStepResult = testStepResults.find((x) => x.text === stepText);
//     if (semver.satisfies(process.version, ">=14.0.0")) {
//       errorMessage = errorMessage.replace(
//         "{ member: [Circular] }",
//         "<ref *1> { member: [Circular *1] }"
//       );
//     }
//     expect(testStepResult.result.status).to.eql(
//       messages.TestStepResultStatus.FAILED
//     );
//     expect(testStepResult.result.message).to.include(errorMessage);
//   }
// );
//
// Then(
//   "scenario {string} attempt {int} step {string} failed with:",
//   function(
//     this: World,
//     pickleName: string,
//     attempt: number,
//     stepText: string,
//     errorMessage: string
//   ) {
//     const testStepResults = getTestStepResults(
//       this.lastRun.envelopes,
//       pickleName,
//       attempt
//     );
//     const testStepResult = testStepResults.find((x) => x.text === stepText);
//     expect(testStepResult.result.status).to.eql(
//       messages.TestStepResultStatus.FAILED
//     );
//     expect(testStepResult.result.message).to.include(errorMessage);
//   }
// );
//
// Then(
//   "scenario {string} step {string} has the doc string:",
//   function(
//     this: World,
//     pickleName: string,
//     stepText: string,
//     docString: string
//   ) {
//     const pickleStep = getPickleStep(
//       this.lastRun.envelopes,
//       pickleName,
//       stepText
//     );
//     expect(pickleStep.argument.docString.content).to.eql(docString);
//   }
// );
//
// Then(
//   "scenario {string} step {string} has the data table:",
//   function(
//     this: World,
//     pickleName: string,
//     stepText: string,
//     dataTable: DataTable
//   ) {
//     const pickleStep = getPickleStep(
//       this.lastRun.envelopes,
//       pickleName,
//       stepText
//     );
//     expect(new DataTable(pickleStep.argument.dataTable)).to.eql(dataTable);
//   }
// );
