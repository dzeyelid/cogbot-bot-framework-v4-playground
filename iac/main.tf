provider "azurerm" {
  version = "~> 2.16"
  features {}
}

module "backend" {
  source = "./modules/backend"

  identifier                = var.identifier
  location                  = var.location
  environment               = var.environment
  bot_web_app_sku           = var.bot_web_app_sku
  app_service_plan_sku_tier = var.app_service_plan_sku_tier
  app_service_plan_sku_size = var.app_service_plan_sku_size
  microsoft_app_id          = var.microsoft_app_id
  microsoft_app_password    = var.microsoft_app_password
}