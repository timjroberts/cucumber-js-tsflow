Feature: Binding steps

    Scenario Outline: Bind steps with <Bind Mode>
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario a
                Given step one
                When step two
                Then step three
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, when, then} from 'cucumber-tsflow';

            @binding()
            class Steps {
                @given(<Step 1>)
                public given() {
                    console.log("Step one executed");
                }

                @when(<Step 2>)
                public when() {
                    console.log("Step two executed");
                }

                @then(<Step 3>)
                public then() {
                    console.log("Step three executed");
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains "Step one executed"
        And the output contains "Step two executed"
        And the output contains "Step three executed"

        Examples:
            | Bind Mode | Step 1       | Step 2       | Step 3         |
            | names     | "step one"   | "step two"   | "step three"   |
            | regex     | /^step one$/ | /^step two$/ | /^step three$/ |

    Scenario: Failing test
        Given a file named "features/a.feature" with:
            """feature
            Feature: Some feature
              Scenario: example
                Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given} from 'cucumber-tsflow';

            @binding()
            class Step {
                @given("a step")
                public step() {
                    throw new Error("Inner error message.");
                }
            }

            export = Step;
            """
        When I run cucumber-js
        Then it fails
        And the output contains "Error: Inner error message."

    Scenario: Missing step definition
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario a
                Given missing step
            """
        When I run cucumber-js
        Then it fails
        # TODO: https://github.com/timjroberts/cucumber-js-tsflow/issues/97
        And the output contains "Implement with the following snippet:"
