resource "azurerm_resource_group" "backend" {
  name      = "rg-${var.identifier}-${var.environment}"
  location  = var.location
}
