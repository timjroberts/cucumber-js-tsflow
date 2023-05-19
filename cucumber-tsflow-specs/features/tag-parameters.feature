Feature: Tag parameters

    Background:
        Given a file named "step_definitions/steps.ts" with:
            """ts
            import * as assert from 'assert';
            import {binding, then, ScenarioInfo} from 'cucumber-tsflow';

            @binding([ScenarioInfo])
            class Steps {
                public constructor(private readonly scenario: ScenarioInfo) {}

                @then("the flag {string} is enabled")
                public checkEnabled(name: string) {
                    assert.ok(this.scenario.getFlag(name))
                }

                @then("the flag {string} is disabled")
                public checkDisabled(name: string) {
                    assert.ok(!this.scenario.getFlag(name))
                }

                @then("the option tag {string} is set to {string}")
                public checkOption(name: string, value: string) {
                    assert.strictEqual(this.scenario.getOptionTag(name), value);
                }

                @then("the option tag {string} is unset")
                public checkOptionUnset(name: string) {
                    assert.strictEqual(this.scenario.getOptionTag(name), undefined);
                }

                @then("the attribute tag {string} is set to {}")
                @then("the attribute tag {string} is set to:")
                public checkAttributes(name: string, values: string) {
                    assert.deepStrictEqual(this.scenario.getAttributeTag(name), JSON.parse(values));
                }

                @then("the attribute tag {string} is unset")
                public checkAttributesUnset(name: string) {
                    assert.deepStrictEqual(this.scenario.getAttributeTag(name), undefined);
                }
            }

            export = Steps;
            """

    Scenario: Checking for an absent flag
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              Scenario: example
                Then the flag "enableFoo" is disabled
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for a flag on the feature
        Given a file named "features/a.feature" with:
            """feature
            @enableFoo
            Feature: Feature
              Scenario: One
                Then the flag "enableFoo" is enabled
              Scenario: Two
                Then the flag "enableFoo" is enabled
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for a flag on the scenario
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              @enableFoo
              Scenario: One
                Then the flag "enableFoo" is enabled
                Then the flag "enableBar" is disabled
              @enableBar
              Scenario: Two
                Then the flag "enableFoo" is disabled
                Then the flag "enableBar" is enabled
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an absent option
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              Scenario: example
                Then the option tag "foo" is unset
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an option on the feature
        Given a file named "features/a.feature" with:
            """feature
            @foo(bar)
            Feature: Feature
              Scenario: One
                Then the option tag "foo" is set to "bar"
              Scenario: Two
                Then the option tag "foo" is set to "bar"
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an option on the scenario
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              @foo(bar)
              Scenario: One
                Then the option tag "foo" is set to "bar"
              @foo(baz)
              Scenario: Two
                Then the option tag "foo" is set to "baz"
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an option on the scenario overriding one on the feature
        Given a file named "features/a.feature" with:
            """feature
            @foo(bar)
            Feature: Feature
              Scenario: One
                Then the option tag "foo" is set to "bar"
              @foo(baz)
              Scenario: Two
                Then the option tag "foo" is set to "baz"
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an absent attribute tag
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              Scenario: example
                Then the attribute tag "foo" is unset
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an attribute tag on the feature
        Given a file named "features/a.feature" with:
            """feature
            @foo({"bar":1})
            Feature: Feature
              Scenario: One
                Then the attribute tag "foo" is set to { "bar": 1 }
              Scenario: Two
                Then the attribute tag "foo" is set to { "bar": 1 }
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an attribute tag on the scenario
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              @foo({"bar":1})
              Scenario: One
                Then the attribute tag "foo" is set to { "bar": 1 }
              @foo({"bar":2})
              Scenario: Two
                Then the attribute tag "foo" is set to { "bar": 2 }
            """
        When I run cucumber-js
        Then it passes

    Scenario: Checking for an attribute tag on the scenario overriding one on the feature
        Given a file named "features/a.feature" with:
            """feature
            @foo({"bar":1})
            Feature: Feature
              Scenario: One
                Then the attribute tag "foo" is set to { "bar": 1 }
              @foo({"not-bar":2})
              Scenario: Two
                Then the attribute tag "foo" is set to { "not-bar": 2 }
            """
        When I run cucumber-js
        Then it passes
