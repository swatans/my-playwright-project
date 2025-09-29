@footer
Feature: Footer checks

  Background:
    Given I open the Saucedemo login page
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be on the inventory page

  Scenario: Social links open externally (Twitter / Facebook / LinkedIn)
    When I click footer social "Twitter"
    Then a new tab should open with "twitter.com"

  Scenario: Copyright year and links
    Then the footer copyright matches current year
    When I click footer "Terms of Service"
    Then the page opens (or link exists)

  Scenario: Footer is present on inventory and cart pages
    When I open the cart page
    Then the footer should be visible
    When I go back to inventory
    Then the footer should be visible
