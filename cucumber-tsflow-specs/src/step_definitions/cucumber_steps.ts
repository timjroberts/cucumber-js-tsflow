import { binding, then, when } from "cucumber-tsflow";
import expect from "expect";
import { parseEnvString } from "../support/helpers";
import { TestRunner } from "../support/runner";

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createFlexibleOutputRegex(text: string): RegExp {
  let pattern = "";

  for (let index = 0; index < text.length; ) {
    const char = text[index];

    if (char === "\r") {
      index += 1;
      continue;
    }

    if (char === "\n") {
      pattern += "\\r?\\n[. ]*";
      index += 1;
      continue;
    }

    if (char === ".") {
      while (text[index] === ".") {
        index += 1;
      }
      pattern += "\\.+";
      continue;
    }

    if (char === " ") {
      while (text[index] === " ") {
        index += 1;
      }
      pattern += " +";
      continue;
    }

    pattern += escapeRegex(char);
    index += 1;
  }

  return new RegExp(pattern, "m");
}

function countMatches(output: string, text: string): number {
  const exactMatches = output.match(new RegExp(escapeRegex(text), "g")) ?? [];

  if (exactMatches.length > 0) {
    return exactMatches.length;
  }

  const regex = createFlexibleOutputRegex(text);
  return Array.from(output.matchAll(new RegExp(regex.source, "gm"))).length;
}

function expectOutputToContain(output: string, text: string): void {
  if (output.includes(text) || createFlexibleOutputRegex(text).test(output)) {
    return;
  }

  expect(output).toContain(text);
}

@binding([TestRunner])
class CucumberSteps {
  public constructor(private readonly runner: TestRunner) {}

  @when("my env includes {string}")
  public setEnvironment(envString: string) {
    this.runner.sharedEnv = parseEnvString(envString);
  }

  @when("I run cucumber-js with env `{}`")
  public async runCucumberWithEnv(envString: string) {
    await this.runner.run(parseEnvString(envString));
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
          `Error Output:\n\n${lastRun.errorOutput}`,
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
    expectOutputToContain(this.runner.lastRun.output, text);
  }

  @then("the output contains {string} once")
  @then("the output contains text once:")
  public checkStdoutContainsOnce(text: string) {
    const { output } = this.runner.lastRun;

    expectOutputToContain(output, text);
    expect(countMatches(output, text)).toBe(1);
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
