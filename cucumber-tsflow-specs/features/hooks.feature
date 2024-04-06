Feature: Support for Cucumber hooks

    Scenario: Binding a before hook
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, before} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'hook has not executed';

                @before()
                public hook() {
                    this.state = 'hook has executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "hook has not executed"
        And the output contains "hook has executed"

    Scenario: Binding an after hook
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, after} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'step has not executed';

                @after()
                public hook() {
                    console.log(this.state);
                }

                @given("a step")
                public given() {
                    this.state = 'step has executed';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains "step has executed"

    Scenario: Binding before and after hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, before, after} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'hook has not executed';

                @before()
                public before() {
                    this.state = 'before hook executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                    this.state = 'step has executed';
                }

                @after()
                public after() {
                    console.log(this.state);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains text:
            """
            .before hook executed
            .step has executed
            """

    Scenario: Binding multiple before hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, before} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'no hook executed';

                @before()
                public hookOne() {
                    console.log(this.state)
                    this.state = 'hook one has executed';
                }

                @before()
                public hookTwo() {
                    console.log(this.state)
                    this.state = 'hook two has executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                    this.state = 'step has executed';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains text:
            """
            .no hook executed
            .hook one has executed
            .hook two has executed
            """

    Scenario: Binding multiple after hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, after} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'no hook executed';

                @given("a step")
                public given() {
                    console.log(this.state)
                    this.state = 'step has executed';
                }

                @after()
                public hookOne() {
                    console.log(this.state)
                    this.state = 'hook one has executed';
                }

                @after()
                public hookTwo() {
                    console.log(this.state);
                    this.state = 'hook two has executed';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains text:
            """
            .no hook executed
            .step has executed
            .hook two has executed
            """

    @oldApis
    Scenario: Attempting to bind named hooks with old cucumber
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, before, after} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'hook has not executed';

                @before({name: 'setup environment'})
                public before() {
                    this.state = 'before hook executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                    this.state = 'step has executed';
                }

                @after({name: 'tear down environment'})
                public after() {
                    console.log(this.state);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it fails
        And the error output contains text:
            """
            Object literal may only specify known properties, and 'name' does not exist in type 'HookOptions'.
            """

    @newApis
    Scenario: Binding named hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, before, after} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'hook has not executed';

                @before({name: 'setup environment'})
                public before() {
                    this.state = 'before hook executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                    this.state = 'step has executed';
                }

                @after({name: 'tear down environment'})
                public after() {
                    console.log(this.state);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the hook "setup environment" was executed on scenario "example"
        And the hook "tear down environment" was executed on scenario "example"

    Scenario: Binding a before step hook
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, beforeStep} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'hook has not executed';

                @beforeStep()
                public hook() {
                    this.state = 'hook has executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "hook has not executed"
        And the output contains "hook has executed"

    Scenario: Binding a before step hook with multiple steps
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
                    And another step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, beforeStep, when} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private counter = 0;

                @beforeStep()
                public hook() {
                    console.log(`${this.counter++} execution: beforeStep`);
                }

                @given("a step")
                public given() {
                    console.log(`${this.counter++} execution: given`);
                }

                @when("another step")
                public when() {
                    console.log(`${this.counter++} execution: when`);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "hook has not executed"
        And the output contains text:
            """
            .0 execution: beforeStep
            1 execution: given
            .2 execution: beforeStep
            3 execution: when
            """

    Scenario: Binding multiple before step hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, beforeStep} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'no hook executed';

                @beforeStep()
                public hookOne() {
                    console.log(this.state)
                    this.state = 'hook one has executed';
                }

                @beforeStep()
                public hookTwo() {
                    console.log(this.state)
                    this.state = 'hook two has executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                    this.state = 'step has executed';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains text:
            """
            .no hook executed
            hook one has executed
            hook two has executed
            """

    Scenario: Binding an after step hook
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, afterStep} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'step has not executed';

                @afterStep()
                public hook() {
                    console.log(this.state);
                }

                @given("a step")
                public given() {
                    this.state = 'step has executed';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains "step has executed"

    Scenario: Binding an after step hook with multiple steps
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
                    And another step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, afterStep, when} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private counter = 0;

                @afterStep()
                public hook() {
                    console.log(`${this.counter++} execution: afterStep`);
                }

                @given("a step")
                public given() {
                    console.log(`${this.counter++} execution: given`);
                }

                @when("another step")
                public when() {
                    console.log(`${this.counter++} execution: when`);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains text:
        """
        .0 execution: given
        1 execution: afterStep
        .2 execution: when
        3 execution: afterStep
        """

    Scenario: Binding multiple after step hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, afterStep} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'no hook executed';

                @given("a step")
                public given() {
                    console.log(this.state)
                    this.state = 'step has executed';
                }

                @afterStep()
                public hookOne() {
                    console.log(this.state)
                    this.state = 'hook one has executed';
                }

                @afterStep()
                public hookTwo() {
                    console.log(this.state);
                    this.state = 'hook two has executed';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains text:
            """
            .no hook executed
            step has executed
            hook two has executed
            """

    Scenario: Binding before and after step hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
                Scenario: example
                    Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, beforeStep, afterStep} from 'cucumber-tsflow';

            @binding()
            class Steps {
                private state = 'hook has not executed';

                @beforeStep()
                public beforeStep() {
                    this.state = 'before hook executed';
                }

                @given("a step")
                public given() {
                    console.log(this.state);
                    this.state = 'step has executed';
                }

                @afterStep()
                public afterStep() {
                    console.log(this.state);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output does not contain "step has not executed"
        And the output contains text:
            """
            .before hook executed
            step has executed
            """
