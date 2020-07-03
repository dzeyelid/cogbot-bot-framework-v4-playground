variable "microsoft_app_id" {
  type = string
}

variable "microsoft_app_password" {
  type = string
}

resource "azurerm_app_service" "backend" {
  name                = "app-${var.identifier}-${var.environment}"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name
  app_service_plan_id = azurerm_app_service_plan.backend.id

  site_config {
    cors {
      allowed_origins = [
        "https://botservice.hosting.portal.azure.net",
        "https://hosting.onecloud.azure-test.net/"
      ]
    }
  }

  app_settings = {
    WEBSITE_NODE_DEFAULT_VERSION = "~10"
    MicrosoftAppId = var.microsoft_app_id
    MicrosoftAppPassword = var.microsoft_app_password
  }
}