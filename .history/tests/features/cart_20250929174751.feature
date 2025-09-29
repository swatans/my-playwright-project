@cart @end2end
Feature: Cart + Checkout end-to-end flow
  Full flow: add to cart, validate badge, verify cart contents, checkout form validations,
  fill checkout info, verify checkout overview (step two), remove items and finish.

  Background:
    Given I open the Saucedemo login page
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be on the inventory page

  # --- CART SCENARIOS -------------------------------------------------------

  Scenario: Add single item to cart and verify cart badge and cart page
    When I add product "Sauce Labs Bike Light" to cart
    Then the cart badge should show "1"
    When I open the cart page
    Then I should see product "Sauce Labs Bike Light" with price "$9.99" in the cart
    And I should be able to remove the product from the cart

  Scenario: Add multiple items and verify cart + proceed to checkout form
    When I add product "Sauce Labs Backpack" to cart
    And I add product "Sauce Labs Bolt T-Shirt" to cart
    Then the cart badge should show "2"
    When I open the cart page
    Then I should see products:
      | name                    | price  |
      | Sauce Labs Backpack     | $29.99 |
      | Sauce Labs Bolt T-Shirt | $15.99 |
    And I click Checkout
    Then I should see the checkout form

  # --- CHECKOUT FORM VALIDATIONS -------------------------------------------

  Scenario Outline: Checkout form validation messages
    When I add product "Sauce Labs Bike Light" to cart
    And I open the cart page
    And I click Checkout
    Then I should see the checkout form
    When I fill checkout form with:
      | firstName  | <firstName> |
      | lastName   | <lastName>  |
      | postalCode | <postalCode>|
    And I submit checkout
    Then I should see checkout error message "<error>"

    Examples:
      | firstName | lastName | postalCode | error                                 |
      |           |          |            | Error: First Name is required         |
      | John      |          |            | Error: Last Name is required          |
      | John      | Doe      |            | Error: Postal Code is required        |

  # --- CHECKOUT HAPPY PATH -------------------------------------------------

  Scenario: Fill checkout form correctly and verify overview (step two)
    When I add product "Sauce Labs Backpack" to cart
    And I add product "Sauce Labs Bolt T-Shirt" to cart
    Then the cart badge should show "2"
    When I open the cart page
    And I click Checkout
    Then I should see the checkout form
    When I fill checkout form with:
      | firstName  | Hendriawan |
      | lastName   | Swatandika |
      | postalCode | 40171      |
    And I submit checkout
    Then I should be on checkout step two
    Then the checkout summary should contain:
      | name                    | price  |
      | Sauce Labs Backpack     | $29.99 |
      | Sauce Labs Bolt T-Shirt | $15.99 |
    And the summary total should be displayed

  # --- FINISH / CLEANUP ----------------------------------------------------

  Scenario: Remove items and finish checkout
    When I add product "Sauce Labs Backpack" to cart
    And I add product "Sauce Labs Bolt T-Shirt" to cart
    Then the cart badge should show "2"
    When I open the cart page
    And I click Checkout
    Then I should see the checkout form
    When I fill checkout form with:
      | firstName  | Hendriawan |
      | lastName   | Swatandika |
      | postalCode | 40171      |
    And I submit checkout
    Then I should be on checkout step two
    When I finish the checkout
    Then I should see the order confirmation page
    And the cart badge should be empty or not displayed
    
