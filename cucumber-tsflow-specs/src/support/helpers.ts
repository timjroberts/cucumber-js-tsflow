// Adapted from:
// https://github.com/cucumber/cucumber-js/blob/6505e61abce385787767f270b6ce2077eb3d7c1c/features/support/message_helpers.ts
import { getGherkinStepMap } from "@cucumber/cucumber/lib/formatter/helpers/gherkin_document_parser";
import {
  getPickleStepMap,
  getStepKeyword,
} from "@cucumber/cucumber/lib/formatter/helpers/pickle_parser";
import { doesHaveValue } from "@cucumber/cucumber/lib/value_checker";
import * as messages from "@cucumber/messages";
import { Query } from "@cucumber/query";
import * as assert from "node:assert";
import util, { inspect } from "util";

export function parseEnvString(str: string): NodeJS.ProcessEnv {
  const result: NodeJS.ProcessEnv = {};
  if (doesHaveValue(str)) {
    try {
      Object.assign(result, JSON.parse(str));
    } catch {
      str
        .split(/\s+/)
        .map((keyValue) => keyValue.split("="))
        .forEach((pair) => (result[pair[0]] = pair[1]));
    }
  }
  return result;
}

export function dump(val: unknown): string {
  return inspect(val, { depth: null });
}

export interface IStepTextAndResult {
  text: string;

  result: messages.TestStepResult;
}

export type SimpleAttachment = Pick<
  messages.Attachment,
  "body" | "mediaType" | "contentEncoding"
>;

export class Extractor {
  public constructor(private readonly envelopes: messages.Envelope[]) {}

  public static logsFromAttachments(
    attachments: messages.Attachment[]
  ): string[] {
    return attachments
      .filter(
        (att) =>
          att.contentEncoding === messages.AttachmentContentEncoding.IDENTITY &&
          att.mediaType === "text/x.cucumber.log+plain"
      )
      .map((att) => att.body);
  }

  public static simplifyAttachment(
    attachment: messages.Attachment
  ): SimpleAttachment {
    return {
      body: attachment.body,
      mediaType: attachment.mediaType,
      contentEncoding: attachment.contentEncoding,
    };
  }

  public getPickleNamesInOrderOfExecution(): string[] {
    const pickleNameMap: Record<string, string> = {};
    const testCaseToPickleNameMap: Record<string, string> = {};
    const result: string[] = [];
    this.envelopes.forEach((e) => {
      if (e.pickle != null) {
        pickleNameMap[e.pickle.id] = e.pickle.name;
      } else if (e.testCase != null) {
        testCaseToPickleNameMap[e.testCase.id] =
          pickleNameMap[e.testCase.pickleId];
      } else if (e.testCaseStarted != null) {
        result.push(testCaseToPickleNameMap[e.testCaseStarted.testCaseId]);
      }
    });
    return result;
  }

  public getPickleStep(
    pickleName: string,
    stepText: string
  ): messages.PickleStep {
    const pickle = this.getPickle(pickleName);
    const gherkinDocument = this.getGherkinDocument(pickle.uri);
    return this.getPickleStepByStepText(pickle, gherkinDocument, stepText);
  }

  public getHookByName(hookName: string,): messages.Hook {
    const hookEnvelope = this.envelopes.find(({hook}) => (
        hook?.name === hookName
    ))

    assert.ok(hookEnvelope, `Unknown hook ${hookName}`);

    return hookEnvelope.hook!;
  }

  public getHookExecutions(pickleName: string, hookId: string): messages.TestStep[] {
    const pickle = this.getPickle(pickleName);
    const testCase = this.getTestCase(pickle.id);

    return testCase.testSteps.filter(step => step.hookId === hookId)
  }

  public getTestCaseResult(pickleName: string): messages.TestStepResult {
    const query = new Query();
    this.envelopes.forEach((envelope) => query.update(envelope));
    const pickle = this.getPickle(pickleName);
    return messages.getWorstTestStepResult(
      query.getPickleTestStepResults([pickle.id])
    );
  }

  public getTestStepResults(
    pickleName: string,
    attempt = 0
  ): IStepTextAndResult[] {
    const pickle = this.getPickle(pickleName);
    const gherkinDocument = this.getGherkinDocument(pickle.uri);
    const testCase = this.getTestCase(pickle.id);
    const testCaseStarted = this.getTestCaseStarted(testCase.id, attempt);
    const testStepIdToResultMap: Record<string, messages.TestStepResult> = {};
    this.envelopes.forEach((e) => {
      if (
        e.testStepFinished != null &&
        e.testStepFinished.testCaseStartedId === testCaseStarted.id
      ) {
        testStepIdToResultMap[e.testStepFinished.testStepId] =
          e.testStepFinished.testStepResult;
      }
    });
    const gherkinStepMap = getGherkinStepMap(gherkinDocument);
    const pickleStepMap = getPickleStepMap(pickle);
    let isBeforeHook = true;
    return testCase.testSteps.map((testStep) => {
      let text;
      if (testStep.pickleStepId == null) {
        text = isBeforeHook ? "Before" : "After";
      } else {
        isBeforeHook = false;
        const pickleStep = pickleStepMap[testStep.pickleStepId];
        const keyword = getStepKeyword({ pickleStep, gherkinStepMap });
        text = `${keyword}${pickleStep.text}`;
      }
      return { text, result: testStepIdToResultMap[testStep.id] };
    });
  }

  public getAttachmentsForStep(
    pickleName: string,
    stepText: string
  ): messages.Attachment[] {
    const pickle = this.getPickle(pickleName);
    const gherkinDocument = this.getGherkinDocument(pickle.uri);
    const testCase = this.getTestCase(pickle.id);
    const pickleStep = this.getPickleStepByStepText(
      pickle,
      gherkinDocument,
      stepText
    );
    assert.ok(
      pickleStep,
      `Step "${stepText}" not found in pickle ${dump(pickle)}`
    );

    const testStep = testCase.testSteps.find(
      (s) => s.pickleStepId === pickleStep.id
    )!;
    const testCaseStarted = this.getTestCaseStarted(testCase.id);
    return this.getTestStepAttachments(testCaseStarted.id, testStep.id);
  }

  public getAttachmentsForHook(
    pickleName: string,
    isBeforeHook: boolean
  ): messages.Attachment[] {
    const pickle = this.getPickle(pickleName);
    const testCase = this.getTestCase(pickle.id);
    // Ignore the first Before hook and the last After hook
    // Those are used to set up and tear down the tsflow harness
    const testStepIndex = isBeforeHook ? 1 : testCase.testSteps.length - 2;
    const testStep = testCase.testSteps[testStepIndex];
    const testCaseStarted = this.getTestCaseStarted(testCase.id);
    return this.getTestStepAttachments(testCaseStarted.id, testStep.id);
  }

  private getPickle(pickleName: string): messages.Pickle {
    const pickleEnvelope = this.envelopes.find(
      (e) => e.pickle != null && e.pickle.name === pickleName
    );
    if (pickleEnvelope == null) {
      throw new Error(
        `No pickle with name "${pickleName}" in this.envelopes:\n ${util.inspect(
          this.envelopes
        )}`
      );
    }
    return pickleEnvelope.pickle!;
  }

  private getGherkinDocument(uri: string): messages.GherkinDocument {
    const gherkinDocumentEnvelope = this.envelopes.find(
      (e) => e.gherkinDocument != null && e.gherkinDocument.uri === uri
    );
    if (gherkinDocumentEnvelope == null) {
      throw new Error(
        `No gherkinDocument with uri "${uri}" in this.envelopes:\n ${util.inspect(
          this.envelopes
        )}`
      );
    }
    return gherkinDocumentEnvelope.gherkinDocument!;
  }

  private getTestCase(pickleId: string): messages.TestCase {
    const testCaseEnvelope = this.envelopes.find(
      (e) => e.testCase != null && e.testCase.pickleId === pickleId
    );
    if (testCaseEnvelope == null) {
      throw new Error(
        `No testCase with pickleId "${pickleId}" in this.envelopes:\n ${util.inspect(
          this.envelopes
        )}`
      );
    }
    return testCaseEnvelope.testCase!;
  }

  private getTestCaseStarted(
    testCaseId: string,
    attempt = 0
  ): messages.TestCaseStarted {
    const testCaseStartedEnvelope = this.envelopes.find(
      (e) =>
        e.testCaseStarted != null &&
        e.testCaseStarted.testCaseId === testCaseId &&
        e.testCaseStarted.attempt === attempt
    );
    if (testCaseStartedEnvelope == null) {
      throw new Error(
        `No testCaseStarted with testCaseId "${testCaseId}" in this.envelopes:\n ${util.inspect(
          this.envelopes
        )}`
      );
    }
    return testCaseStartedEnvelope.testCaseStarted!;
  }

  private getPickleStepByStepText(
    pickle: messages.Pickle,
    gherkinDocument: messages.GherkinDocument,
    stepText: string
  ): messages.PickleStep {
    const gherkinStepMap = getGherkinStepMap(gherkinDocument);
    return pickle.steps.find((s) => {
      const keyword = getStepKeyword({ pickleStep: s, gherkinStepMap });
      return `${keyword}${s.text}` === stepText;
    })!;
  }

  private getTestStepAttachments(
    testCaseStartedId: string,
    testStepId: string
  ): messages.Attachment[] {
    return this.envelopes
      .filter(
        (e) =>
          e.attachment != null &&
          e.attachment.testCaseStartedId === testCaseStartedId &&
          e.attachment.testStepId === testStepId
      )
      .map((e) => e.attachment!);
  }
}
