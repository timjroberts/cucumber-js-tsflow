Feature: Basic Test Feature

    Scenario: Basic test scenario
        Given I run cucumber-js
        Then it runs 0 scenarios

    Scenario: Step binding
        Given a file named "features/a.feature" with:
            """
            Feature: some feature
              Scenario:
                Given a step passes
                When a step passes
                Then a step passes
            """
        And a file named "step_definitions/steps.ts" with:
            """
            import {binding, given} from 'cucumber-tsflow';

            @binding()
            class Steps {
                @given("a step passes")
                public pass() {}
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
