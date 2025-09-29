@homepage @smoke
Feature: Homepage / Product list validations

  Background:
    Given I open the Saucedemo login page
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be on the inventory page

  Scenario: Product names and price format
    Then all product names start with "Sauce Labs"
    And all product prices have format "$XX.XX"

  Scenario: Product Detail Page navigation
    When I open the product detail page for "Sauce Labs Backpack"
    Then I should see product name "Sauce Labs Backpack" on the PDP

  Scenario: Sorting Name (A to Z) and persists
    When I sort products by "Name (A to Z)"
    Then products are sorted alphabetically ascending
    When I refresh the page
    Then products remain sorted by "Name (A to Z)"

  Scenario: Sorting Price (low to high)
    When I sort products by "Price (low to high)"
    Then products are sorted by price ascending
