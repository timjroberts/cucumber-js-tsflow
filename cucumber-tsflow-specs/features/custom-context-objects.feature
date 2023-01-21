Feature: Custom context objects

    Scenario: Using custom context objects to share state
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario a
                Given the state is "initial value"
                When I set the state to "step value"
                Then the state is "step value"
            """
        And a file named "support/state.ts" with:
            """ts
            export class State {
                public value: string = "initial value";
            }
            """
        And a file named "step_definitions/one.ts" with:
            """ts
            import {State} from '../support/state';
            import {binding, when} from 'cucumber-tsflow';

            @binding([State])
            class Steps {
                public constructor(private readonly state: State) {}

                @when("I set the state to {string}")
                public setState(newValue: string) {
                    this.state.value = newValue;
                }
            }

            export = Steps;
            """
        And a file named "step_definitions/two.ts" with:
            """ts
            import {State} from '../support/state';
            import {binding, then} from 'cucumber-tsflow';
            import * as assert from 'node:assert';

            @binding([State])
            class Steps {
                public constructor(private readonly state: State) {}

                @then("the state is {string}")
                public checkValue(value: string) {
                    console.log(`The state is '${this.state.value}'`);
                    assert.equal(this.state.value, value, "State value does not match");
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains "The state is 'initial value'"
        And the output contains "The state is 'step value'"
