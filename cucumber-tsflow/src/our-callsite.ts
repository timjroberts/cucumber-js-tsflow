import * as callsites from "callsites";
// @ts-ignore
import * as sourceMapSupport from "source-map-support";

/**
 * Represents a callsite of where a step binding is being applied.
 */
export class Callsite {
  /**
   * Initializes a new [[Callsite]].
   *
   * @param filename The filename of the callsite.
   * @param lineNumber The line number of the callsite.
   */
  constructor(public filename: string, public lineNumber: number) {}

  /**
   * Returns a string representation of the callsite.
   *
   * @returns A string representing the callsite formatted with the filename and line
   * number.
   */
  public toString(): string {
    return `${this.filename}:${this.lineNumber}`;
  }

  /**
   * Captures the current [[Callsite]] object.
   */
  public static capture(): Callsite {
    const stack = callsites()[2];
    const tsStack = sourceMapSupport.wrapCallSite(stack);
    return new Callsite(
      tsStack.getFileName() || "",
      tsStack.getLineNumber() || -1
    );
  }
}
