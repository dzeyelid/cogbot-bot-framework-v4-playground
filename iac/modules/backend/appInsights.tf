resource "azurerm_application_insights" "backend" {
  name                = "appi-${var.identifier}-${var.environment}"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name
  application_type    = "web"
}

resource "azurerm_application_insights_api_key" "full_permissions" {
  name                    = "appi-${var.identifier}-${var.environment}-api-key"
  application_insights_id = azurerm_application_insights.backend.id
  read_permissions        = ["agentconfig", "aggregate", "api", "draft", "extendqueries", "search"]
  write_permissions       = ["annotations"]
}