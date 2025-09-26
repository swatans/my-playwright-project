Feature: Saucedemo - Login

  Background:
    Given I open the Saucedemo login page

  Scenario: Login with valid credentials (standard_user)
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be on the inventory page
    And I should see "Products"

  Scenario: Login with locked out user
    When I login with username "locked_out_user" and password "secret_sauce"
    Then I should see error message "Epic sadface: Sorry, this user has been locked out."

  Scenario Outline: Validation errors
    When I login with username "<username>" and password "<password>"
    Then I should see error message "<message>"

    Examples:
      | username | password      | message                                                                 |
      |          | secret_sauce  | Epic sadface: Username is required                                      |
      | standard_user |            | Epic sadface: Password is required                                     |
      | wrong_user | wrong_pass   | Epic sadface: Username and password do not match any user in this service |

  Scenario: Problem user UI glitch
    When I login with username "problem_user" and password "secret_sauce"
    Then I should be on the inventory page
    And the product images should be displayed correctly (or assert known glitch)

  Scenario: Performance user (smoke)
    When I login with username "performance_glitch_user" and password "secret_sauce"
    Then I should be on the inventory page within 10s

  Scenario: Visual baseline
    When I login with username "visual_user" and password "secret_sauce"
    Then I take a screenshot named "visual_user_inventory.png"
