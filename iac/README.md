# Deploy resources on Azure with Terraform

You need Terraform. If you don't have it, [install it](https://learn.hashicorp.com/terraform/azure/install).

Replace `AtLeastSixteenCharacters_0` with an actual password string that suite the requirements.

The password will be used as `microsoft_app_password` below.
And `appId` in the returned values will be used as `microsoft_app_id` below.

```ps1
az ad app create `
  --display-name 'cogbot-bot-framework-v4-demo' `
  --password 'AtLeastSixteenCharacters_0' `
  --available-to-other-tenants
```

Copy `iac/terraform.example.tfvars` as `iac/terraform.example.tfvars` like below. And fill the values like `microsoft_app_id` and `microsoft_app_password`.

```ps1
cp iac/terraform.example.tfvars iac/terraform.tfvars
```

```ps1
cd iac
terraform init
terraform plan
terraform apply
```

after applying, 2 outputs shows. The "<resource-group-name>" and "<name-of-web-app>" will be used below.

```
Outputs:

resource_group_name = <resource-group-name>
web_app_name = <name-of-web-app>
```

Prepare code

```ps1
cd ../bot/my-chat-bot

az bot prepare-deploy --code-dir "." --lang Typescript

Compress-Archive `
  -LiteralPath `
    lib, node_modules, src, package.json, tsconfig.json, web.config `
  -DestinationPath ./bot.zip `
  -Force
```

Replace `<name-of-web-app>` and `<resource-group-name>` with above values and excute it.

```ps1
az webapp deployment source config-zip `
  --resource-group "<resource-group-name>" `
  --name "<name-of-web-app>" `
  --src ./bot.zip
```