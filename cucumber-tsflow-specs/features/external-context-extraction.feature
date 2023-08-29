Feature: Extracing context objects from World externally

    Scenario: Failing to retrieve state from a non-initialized World object
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario a
                Given a step
            """
        And a file named "support/state.ts" with:
            """ts
            export class State {
                public constructor() {
                  console.log('State has been initialized');
                }

                public value: string = "initial value";
            }
            """
        And a file named "step_definitions/a.ts" with:
            """ts
            import {State} from '../support/state';
            import {Before, Given} from '@cucumber/cucumber';
            import {getBindingFromWorld} from 'cucumber-tsflow';

            Before(function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style before. State is "${state.value}"`);

              state.value = 'cucumber-style before';
            });

            Given('a step', function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style step. State is "${state.value}"`);

              state.value = 'cucumber-style step';
            });
            """
        When I run cucumber-js
        Then it fails
        And the output contains text:
            """
            Before # step_definitions/a.ts:5
                   Error: Scenario context have not been initialized in the provided World object.
            """

    Scenario: Sharing a state between native Cucumber and Decorator-style steps
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario a
                Given a cucumber-style step is called
                And a decorator-style step is called
            """
        And a file named "support/state.ts" with:
            """ts
            export class State {
                public constructor() {
                  console.log('State has been initialized');
                }

                public value: string = "initial value";
            }
            """
        And a file named "step_definitions/a.ts" with:
            """ts
            import {State} from '../support/state';
            import {Before, Given} from '@cucumber/cucumber';
            import {ensureWorldIsInitialized,getBindingFromWorld} from 'cucumber-tsflow';

            ensureWorldIsInitialized();

            Before(function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style before. State is "${state.value}"`);

              state.value = 'cucumber-style before';
            });

            Given('a cucumber-style step is called', function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style step. State is "${state.value}"`);

              state.value = 'cucumber-style step';
            });
            """
        And a file named "step_definitions/b.ts" with:
            """ts
            import {State} from '../support/state';
            import {binding, before, given} from 'cucumber-tsflow';

            @binding([State])
            class Steps {
                public constructor(private readonly state: State) {}

                @before()
                public before() {
                    console.log(`Decorator-style before. State is "${this.state.value}"`);

                    this.state.value = 'decorator-style before';
                }

                @given('a decorator-style step is called')
                public step() {
                    console.log(`Decorator-style step. State is "${this.state.value}"`);

                    this.state.value = 'decorator-style step';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text:
            """
            .State has been initialized
            Cucumber-style before. State is "initial value"
            .Decorator-style before. State is "cucumber-style before"
            .Cucumber-style step. State is "decorator-style before"
            .Decorator-style step. State is "cucumber-style step"
            """
