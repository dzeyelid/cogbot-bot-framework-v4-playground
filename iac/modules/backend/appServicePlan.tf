variable app_service_plan_sku_tier {
  type = string
  default = "PremiumV2"

  validation {
    condition     = can(regex("^Free|Shared|Basic|Standard|PremiumV2|Isolated$", var.app_service_plan_sku_tier))
    error_message = "Valid options are 'Free', 'Shared', 'Basic', 'Standard', 'PremiumV2' and 'Isolated'."
  }
}

variable app_service_plan_sku_size {
  type        = string
  default     = "P1v2"

  validation {
    condition     = can(regex("^B1|B2|B3|D1|F1|P1v2|P2v2|P3v2|SHARED$", var.app_service_plan_sku_size))
    error_message = "Valid options are 'B1', 'B2', 'B3', 'D1', 'F1', 'P1v2', 'P2v2', 'P3v2' and 'SHARED'."
  }
}

resource "azurerm_app_service_plan" "backend" {
  name                = "plan-${var.identifier}-${var.environment}"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name
  kind                = "app"

  sku {
    tier = var.app_service_plan_sku_tier
    size = var.app_service_plan_sku_size
  } 
}