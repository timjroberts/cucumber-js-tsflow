import { binding, then, when } from "cucumber-tsflow";
import expect from "expect";
import { parseEnvString } from "../support/helpers";
import { TestRunner } from "../support/runner";

@binding([TestRunner])
class CucumberSteps {
  public constructor(private readonly runner: TestRunner) {}

  @when("my env includes {string}")
  public setEnvironment(envString: string) {
    this.runner.sharedEnv = parseEnvString(envString);
  }

  @when("I run cucumber-js with env `{}`")
  public async runCucumberWithEnv(envString: string) {
    await this.runner.run(
      parseEnvString(envString)
    );
  }

  @when("I run cucumber-js")
  public async runCucumber() {
    await this.runner.run();
  }

  @then("it passes")
  public checkPassed() {
    const { lastRun } = this.runner;

    if (lastRun?.error != null) {
      throw new Error(
        `Last run errored unexpectedly. Output:\n\n${lastRun.output}\n\n` +
        `Error Output:\n\n${lastRun.errorOutput}`
      );
    }
  }

  @then("it fails")
  public ensureFailure() {
    const exitCode = this.runner.lastRun.error?.code ?? 0;
    expect(exitCode).not.toBe(0);

    this.runner.verifiedLastRunError = true;
  }

  @then("the output contains {string}")
  @then("the output contains text:")
  public checkStdoutContains(text: string) {
    expect(this.runner.lastRun.output).toContain(text);
  }

  @then("the output contains {string} once")
  @then("the output contains text once:")
  public checkStdoutContainsOnce(text: string) {
    const { output } = this.runner.lastRun;

    expect(output).toContain(text);

    const firstOccurrence = output.indexOf(text);
    const remaining = output.substring(firstOccurrence + 1);

    expect(remaining).not.toContain(text);
  }

  @then("the output does not contain {string}")
  @then("the output does not contain text:")
  public checkStdoutDoesNotContains(text: string) {
    expect(this.runner.lastRun.output).not.toContain(text);
  }

  @then("the error output contains {string}")
  @then("the error output contains text:")
  public checkStderrContains(text: string) {
    expect(this.runner.lastRun.errorOutput).toContain(text);
  }

  @then("the error output does not contain {string}")
  @then("the error output does not contain text:")
  public checkStderrDoesNotContains(text: string) {
    expect(this.runner.lastRun.errorOutput).not.toContain(text);
  }
}

export = CucumberSteps;

// Then(
//   "the output contains these types and quantities of message:",
//   function(this: World, expectedMessages: DataTable) {
//     const envelopes = this.lastRun.output
//       .split("\n")
//       .filter((line) => !!line)
//       .map((line) => JSON.parse(line));
//     expectedMessages.rows().forEach(([type, count]) => {
//       expect(envelopes.filter((envelope) => !!envelope[type])).to.have.length(
//         Number(count),
//         `Didn't find expected number of ${type} messages`
//       );
//     });
//   }
// );
