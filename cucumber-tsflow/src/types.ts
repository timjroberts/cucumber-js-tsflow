/**
 * A string representation of a [[RegExp]] that defines a Cucumber step pattern.
 */
export type StepPattern = string;

/**
 * A Cucumber tag name.
 */
export type TagName = string;

/**
 * Represents a class that will be injected into a binding class to provide context
 * during the execution of a Cucumber scenario.
 */
export interface ContextType {
  /**
   * A default constructor.
   */
  new (): any;
}

export type TypeDecorator = <T>(target: { new (...args: any[]): T }) => void;
