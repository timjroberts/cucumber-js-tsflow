// tslint:disable:no-bitwise
/**
 * The CucumberJS step binding types.
 */
export enum StepBindingFlags {
  /**
   * No bindings.
   */
  none = 0,

  /**
   * A 'Given' step definition binding.
   */
  given = 1 << 0,

  /**
   * A 'When' step definition binding.
   */
  when = 1 << 1,

  /**
   * A 'Then' step definition binding.
   */
  then = 1 << 2,

  /**
   * A 'Before' hook binding.
   */
  before = 1 << 3,

  /**
   * An 'After' hook binding.
   */
  after = 1 << 4,

  /**
   * A 'Before All' hook binding.
   */
  beforeAll = 1 << 5,

  /**
   * An 'After All' hook binding.
   */
  afterAll = 1 << 6,

  /**
   * A 'Before Step' hook binding.
   */
  beforeStep = 1 << 7,

  /**
   * An 'After Step' hook binding.
   */
  afterStep = 1 << 8,

  /**
   * All step definition bindings.
   */
  StepDefinitions = StepBindingFlags.given |
    StepBindingFlags.when |
    StepBindingFlags.then,

  /**
   * All hook bindings.
   */
  Hooks = StepBindingFlags.before |
    StepBindingFlags.after |
    StepBindingFlags.beforeAll |
    StepBindingFlags.afterAll |
    StepBindingFlags.beforeStep |
    StepBindingFlags.afterStep,
}
