terraform {
  experiments = [variable_validation]

  required_providers {
    azurerm = {
      version = "~> 2.16.0"
    }
  }
}
