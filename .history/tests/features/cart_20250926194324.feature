Feature: Cart flow
  Background:
    Given I open the Saucedemo login page
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be on the inventory page
@cart
  Scenario: Add single item to cart and verify cart badge and cart page
    When I add product "Sauce Labs Bike Light" to cart
    Then the cart badge should show "1"
    When I open the cart page
    Then I should see product "Sauce Labs Bike Light" with price "$9.99" in the cart
    And I should be able to remove the product from the cart
@cart
  Scenario: Add multiple items and checkout presence
    When I add product "Sauce Labs Backpack" to cart
    And I add product "Sauce Labs Bolt T-Shirt" to cart
    Then the cart badge should show "2"
    When I open the cart page
    Then I should see products:
      | name                   | price   |
      | Sauce Labs Backpack    | $29.99  |
      | Sauce Labs Bolt T-Shirt| $15.99  |
    And I click Checkout
    Then I should see the checkout form
