Feature: Sidebar / Hamburger menu actions

  Background:
    Given I open the Saucedemo login page
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be on the inventory page

  Scenario: Open and close sidebar menu
    When I open the sidebar menu
    Then the sidebar should be visible
    When I close the sidebar menu
    Then the sidebar should be hidden

  Scenario: Click "All Items" returns to inventory
    When I open the sidebar menu
    And I click the "All Items" menu entry
    Then I should be on the inventory page

  Scenario: Click "About" opens external site in a new tab
    When I open the sidebar menu
    And I click the "About" menu entry
    Then a new tab should open to "saucelabs.com"

  Scenario: Click "Reset App State" clears cart/badge
    When I add product "Sauce Labs Bike Light" to cart
    And the cart badge should show "1"
    When I open the sidebar menu
    And I click the "Reset App State" menu entry
    Then the cart badge should show "0"

  Scenario: Click "Logout" goes back to login page
    When I open the sidebar menu
    And I click the "Logout" menu entry
    Then I should see the login page
