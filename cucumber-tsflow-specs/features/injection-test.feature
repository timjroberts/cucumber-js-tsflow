@injection
Feature: Test Features with injection support.

Scenario: change can be seen among the shared workspace
    When I change the workspace in one step definition class
    Then I can see changed state in another step definition class





