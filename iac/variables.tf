variable "identifier" {
  type = string
}

variable "environment" {
  type = string
  default = "dev"
}

variable "location" {
  type = string
  default = "japaneast"
}

variable "bot_web_app_sku" {
  type = string
}

variable "app_service_plan_sku_tier" {
  type = string
}

variable "app_service_plan_sku_size" {
  type = string
}

variable "microsoft_app_id" {
  type = string
}

variable "microsoft_app_password" {
  type = string
}
