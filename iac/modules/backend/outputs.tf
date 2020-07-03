output "resource_group_name" {
  value = azurerm_resource_group.backend.name
}

output "web_app_name" {
  value = azurerm_app_service.backend.name
}
