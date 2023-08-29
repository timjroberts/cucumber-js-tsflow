Feature: Extracing context objects from World externally

    Scenario: Initializing a state from a first bound externally
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
            import {getBindingFromWorld} from 'cucumber-tsflow';

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
                public step() {
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
            aaasdasdasdad
            """
