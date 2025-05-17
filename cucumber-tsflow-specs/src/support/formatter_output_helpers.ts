import {
  IJsonFeature,
  IJsonScenario,
  IJsonStep,
} from "@cucumber/cucumber/lib/formatter/json_formatter";
import { valueOrDefault } from "@cucumber/cucumber/lib/value_checker";
import * as messages from "@cucumber/messages";

function normalizeExceptionAndUri(exception: string, cwd: string): string {
  return exception
    .replace(cwd, "")
    .replace(/\\/g, "/")
    .replace("/features", "features")
    .split("\n")[0];
}

function normalizeMessage(obj: any, cwd: string): void {
  if (obj.uri != null) {
    obj.uri = normalizeExceptionAndUri(obj.uri, cwd);
  }
  if (obj.sourceReference?.uri != null) {
    obj.sourceReference.uri = normalizeExceptionAndUri(
      obj.sourceReference.uri,
      cwd,
    );
  }
  if (obj.testStepResult != null) {
    if (obj.testStepResult.duration != null) {
      obj.testStepResult.duration.nanos = 0;
    }
    if (obj.testStepResult.message != null) {
      obj.testStepResult.message = normalizeExceptionAndUri(
        obj.testStepResult.message,
        cwd,
      );
    }
  }
}

export function normalizeMessageOutput(
  envelopeObjects: messages.Envelope[],
  cwd: string,
): messages.Envelope[] {
  envelopeObjects.forEach((e: any) => {
    for (const key of Object.keys(e)) {
      normalizeMessage(e[key], cwd);
    }
  });
  return envelopeObjects;
}

export function stripMetaMessages(
  envelopeObjects: messages.Envelope[],
): messages.Envelope[] {
  return envelopeObjects.filter((e: any) => {
    // filter off meta objects, almost none of it predictable/useful for testing
    return e.meta == null;
  });
}

export function normalizeJsonOutput(str: string, cwd: string): IJsonFeature[] {
  const json: IJsonFeature[] = JSON.parse(valueOrDefault(str, "[]"));
  json.forEach((feature: IJsonFeature) => {
    if (feature.uri != null) {
      feature.uri = normalizeExceptionAndUri(feature.uri, cwd);
    }
    feature.elements.forEach((element: IJsonScenario) => {
      element.steps.forEach((step: IJsonStep) => {
        if (step.match != null && step.match.location != null) {
          step.match.location = normalizeExceptionAndUri(
            step.match.location,
            cwd,
          );
        }
        if (step.result != null) {
          if (step.result.duration != null) {
            step.result.duration = 0;
          }
          if (step.result.error_message != null) {
            step.result.error_message = normalizeExceptionAndUri(
              step.result.error_message,
              cwd,
            );
          }
        }
      });
    });
  });
  return json;
}

export const ignorableKeys = [
  "meta",
  // sources
  "uri",
  "line",
  // ids
  "astNodeId",
  "astNodeIds",
  "hookId",
  "id",
  "pickleId",
  "pickleStepId",
  "stepDefinitionIds",
  "testCaseId",
  "testCaseStartedId",
  "testStepId",
  // time
  "nanos",
  "seconds",
  // errors
  "message",
];
