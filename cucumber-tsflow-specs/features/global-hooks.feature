Feature: Support for Cucumber hooks

    Scenario: Binding a beforeAll hook
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example one
                    Given a step

                Scenario: example two
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, beforeAll} from 'cucumber-tsflow';

            @binding()
            class Steps {
                @beforeAll()
                public static hook() {
                    console.log('hook exec')
                }

                @given("a step")
                public given() {
                    console.log('step exec');
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text once:
            """
            hook exec
            .step exec
            ...step exec
            ..
            """

    Scenario: Binding a afterAll hook
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example one
                    Given a step

                Scenario: example two
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, afterAll} from 'cucumber-tsflow';

            @binding()
            class Steps {
                @afterAll()
                public static hook() {
                    console.log('hook exec')
                }

                @given("a step")
                public given() {
                    console.log('step exec');
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text once:
            """
            .step exec
            ...step exec
            ..hook exec
            """

    Scenario: Binding beforeAll and afterAll hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example one
                    Given a step

                Scenario: example two
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, beforeAll, afterAll} from 'cucumber-tsflow';

            @binding()
            class Steps {
                @beforeAll()
                public static before() {
                    console.log('before exec')
                }

                @afterAll()
                public static after() {
                    console.log('after exec')
                }

                @given("a step")
                public given() {
                    console.log('step exec');
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text once:
            """
            before exec
            .step exec
            ...step exec
            ..after exec
            """

    Scenario: Binding multiple beforeAll hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example one
                    Given a step

                Scenario: example two
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, beforeAll} from 'cucumber-tsflow';

            @binding()
            class Steps {
                @beforeAll()
                public static one() {
                    console.log('one')
                }

                @beforeAll()
                public static two() {
                    console.log('two')
                }

                @given("a step")
                public given() {
                    console.log('step');
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text once:
            """
            one
            two
            .step
            ...step
            ..
            """

    Scenario: Binding multiple afterAll hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example one
                    Given a step

                Scenario: example two
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, afterAll} from 'cucumber-tsflow';

            @binding()
            class Steps {
                @afterAll()
                public static one() {
                    console.log('one')
                }

                @afterAll()
                public static two() {
                    console.log('two')
                }

                @given("a step")
                public given() {
                    console.log('step');
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text once:
            """
            .step
            ...step
            ..two
            one
            """
