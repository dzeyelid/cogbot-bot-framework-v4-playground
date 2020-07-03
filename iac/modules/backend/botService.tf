variable bot_web_app_sku {
  type = string
  default = "F0"

  validation {
    condition     = can(regex("^F0|S1$", var.bot_web_app_sku))
    error_message = "The sku value should be F0 or S1."
  }
}

resource "azurerm_bot_web_app" "backend" {
  name                = "bot-${var.identifier}-${var.environment}"
  location            = "global"
  resource_group_name = azurerm_resource_group.backend.name
  sku                 = var.bot_web_app_sku
  microsoft_app_id    = var.microsoft_app_id
  endpoint            = "https://${azurerm_app_service.backend.default_site_hostname}/api/messages"
  developer_app_insights_key            = azurerm_application_insights.backend.instrumentation_key
  developer_app_insights_api_key        = azurerm_application_insights_api_key.full_permissions.api_key
  developer_app_insights_application_id = azurerm_application_insights.backend.app_id
}
