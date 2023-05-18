import logger from "./logger";
import { TagName } from "./types";

/**
 * Provides information about a running Cucumber scenario.
 */
export class ScenarioInfo {
  private _attributeTags?: Map<string, Record<string, string>>;

  private _optionTags?: Map<string, string>;

  private _flagTags?: Set<string>;

  /**
   * Initializes the [[ScenarioInfo]] object.
   *
   * @param scenarioTitle The string title of the currently running Cucumber scenario.
   * @param tags An array of [[TagName]] representing the tags that are in scope for the currently
   * running Cucumber scenario.
   */
  constructor(public scenarioTitle: string, public tags: TagName[]) {}

  private static parseAttributeTags(_tags: TagName[]): Map<string, Record<string, string>> {
    return new Map();
  }

  private static parseOptionTags(tags: TagName[]): Map<string, string> {
    const RGX = /^@?(?<option>[\w-]+)\((?<value>.+?)\)$/s;

    const result = new Map<string, string>();

    for (const tag of tags) {
      const match = tag.match(RGX)?.groups;

      if (match !== undefined) {
        const { option, value } = match;
        result.set(option, value);
      }
    }

    logger.trace("Parsed options", { fromTags: tags, options: result });

    return result;
  }

  private static parseFlagTags(tags: TagName[]): Set<string> {
    const RGX = /^@?(?<flag>[\w-]+)$/s;

    const result = new Set<string>();

    for (const tag of tags) {
      const flag = tag.match(RGX)?.groups?.flag;

      if (flag !== undefined) {
        result.add(flag);
      }
    }

    logger.trace("Parsed flags", { fromTags: tags, flags: result });

    return result;
  }

  public getAttributeTag(name: string): Record<string, string> | undefined {
    if (this._attributeTags === undefined) {
      this._attributeTags = ScenarioInfo.parseAttributeTags(this.tags);
    }

    return this._attributeTags.get(name);
  }

  public getOptionTag(name: string): string | undefined {
    if (this._optionTags === undefined) {
      this._optionTags = ScenarioInfo.parseOptionTags(this.tags);
    }

    return this._optionTags.get(name);
  }

  public getFlag(name: string): boolean {
    if (this._flagTags === undefined) {
      this._flagTags = ScenarioInfo.parseFlagTags(this.tags);
    }

    return this._flagTags.has(name);
  }
}
