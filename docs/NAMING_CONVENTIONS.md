# Naming Conventions

This document outlines the naming conventions used throughout the project.

## AWS Resources

### S3 Buckets
- **Terraform State**: `stat-tracker-terraform-state-{your-name}`
  - Example: `stat-tracker-terraform-state-john`
  - Must be globally unique
  - Lowercase, hyphens only

### DynamoDB Tables
- **State Locking**: `stat-tracker-terraform-locks`
- **Application Tables**: `{project-name}-{table-name}`
  - Example: `stat-tracker-users`, `stat-tracker-habits`, `stat-tracker-completions`
  - Lowercase, hyphens only

### Lambda Functions
- Format: `{project-name}-{function-name}`
  - Example: `stat-tracker-get-user-data`, `stat-tracker-create-habit`
  - Lowercase, hyphens only

### API Gateway
- Format: `{project-name}-api`
  - Example: `stat-tracker-api`

### CloudFront
- Format: `{project-name}-cdn`
  - Example: `stat-tracker-cdn`

### Cognito
- User Pool: `{project-name}-user-pool`
- User Pool Client: `{project-name}-client`

### IAM Roles
- Format: `{project-name}-{role-name}-role`
  - Example: `stat-tracker-lambda-execution-role`

## Terraform Resources

### Resource Names
- Use snake_case: `aws_s3_bucket.main`, `aws_dynamodb_table.users`
- Descriptive names that indicate purpose

### Variables
- Use snake_case: `project_name`, `aws_region`
- Clear, descriptive names

### Outputs
- Use snake_case: `api_gateway_url`, `cognito_user_pool_id`

## Code

### JavaScript/TypeScript
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Components: PascalCase

### Terraform Files
- Files: snake_case.tf
- Resources: snake_case

## General Rules

1. **Lowercase**: All AWS resource names must be lowercase
2. **Hyphens**: Use hyphens for AWS resource names (S3, DynamoDB, etc.)
3. **Underscores**: Use underscores for Terraform resource names and variables
4. **No spaces**: Never use spaces in resource names
5. **Descriptive**: Names should clearly indicate purpose
6. **Consistent**: Follow the same pattern throughout the project

