@esm

Feature: ESM Feature

  Scenario: Working with an ESM module
    Given a file named "features/a.feature" with:
            """feature
            Feature: ESM feature
              Scenario: ESM scenario
                Given step one
            """
    And a file named "step_definitions/steps.mts" with:
            """mts
            import {binding, given} from 'cucumber-tsflow';

            @binding()
            export default class {
                @given("step one")
                public given() {
                    console.log("Step executed");
                }
            }
            """
    When I run cucumber-js
    Then it passes
    And the output contains "Step executed"
