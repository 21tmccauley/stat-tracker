# outputs.tf
# Output important values for use in frontend and other resources

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID for frontend authentication"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito Client ID for frontend authentication"
  value       = aws_cognito_user_pool_client.main.id
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend deployment"
  value       = aws_s3_bucket.frontend.id
}

output "dynamodb_users_table" {
  description = "DynamoDB Users table name"
  value       = aws_dynamodb_table.users.name
}

output "dynamodb_habits_table" {
  description = "DynamoDB Habits table name"
  value       = aws_dynamodb_table.habits.name
}

output "dynamodb_completions_table" {
  description = "DynamoDB Completions table name"
  value       = aws_dynamodb_table.completions.name
}

output "aws_region" {
  description = "AWS region where resources are deployed"
  value       = var.aws_region
}

output "api_gateway_url" {
  description = "API Gateway base URL for Lambda functions"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "get_user_data_endpoint" {
  description = "Full URL for getUserData Lambda endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/user-data"
}

output "create_habit_endpoint" {
  description = "Full URL for createHabit Lambda endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/habits"
}

output "complete_habit_endpoint" {
  description = "Full URL for completeHabit Lambda endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/habits/complete"
}