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
     * All step definition bindings.
     */
    StepDefinitions = StepBindingFlags.given | StepBindingFlags.when | StepBindingFlags.then,

    /**
     * All hook bindings.
     */
    Hooks = StepBindingFlags.before | StepBindingFlags.after
}
