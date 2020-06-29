import * as stack from "callsite";

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
    const stackFrame = stack()[2];

    return new Callsite(stackFrame.getFileName(), stackFrame.getLineNumber());
  }
}
