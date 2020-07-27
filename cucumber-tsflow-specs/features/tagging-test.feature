@tags
Feature: Test Features with Tagging support.

@tag1
Scenario: Test step definitions without tags
  Because in 'basic-test.ts' step definition is not tagged,
  the step definition will be used here as well.

    Given some step to be executed
    When the condition is right
    Then we can see the result correctly

@wip
@tag2
Scenario: Test step definitions with tags

    Given some step to be executed with tag
    When the condition is right with tag
    Then we can see the result correctly with tag



