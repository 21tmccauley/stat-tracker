# infrastructure/lambda.tf
# Lambda functions and API Gateway configuration

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

# IAM policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ]
      Resource = [
        aws_dynamodb_table.users.arn,
        aws_dynamodb_table.habits.arn,
        aws_dynamodb_table.completions.arn
      ]
    }]
  })
}

# CloudWatch Logs permission (Lambda needs this to write logs)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Package the Lambda function code into a zip file
# This data source creates a zip file from the Lambda function directory
data "archive_file" "get_user_data_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/getUserData"
  output_path = "${path.module}/../backend/getUserData.zip"
  
  # Exclude zip file and git files from the archive
  # node_modules is included so Lambda has access to AWS SDK dependencies
  excludes = ["*.zip", ".git"]
}

# Lambda function for getUserData
resource "aws_lambda_function" "get_user_data" {
  filename         = data.archive_file.get_user_data_zip.output_path
  function_name    = "${var.project_name}-get-user-data"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.get_user_data_zip.output_base64sha256
  
  # Node.js 20.x runtime (supports ES modules)
  runtime = "nodejs20.x"
  
  # Environment variables passed to Lambda
  # Note: AWS_REGION is automatically provided by Lambda - don't set it manually
  environment {
    variables = {
      USERS_TABLE_NAME       = aws_dynamodb_table.users.name
      HABITS_TABLE_NAME      = aws_dynamodb_table.habits.name
      COMPLETIONS_TABLE_NAME = aws_dynamodb_table.completions.name
    }
  }
  
  tags = local.common_tags
}

# API Gateway REST API
# This creates the API endpoint that will call our Lambda
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-api"
  description = "API Gateway for Stat Tracker application"
  
  # CORS configuration at API level
  endpoint_configuration {
    types = ["REGIONAL"]  # Regional is cheaper than EDGE
  }
  
  tags = local.common_tags
}

# API Gateway resource for /user-data endpoint
resource "aws_api_gateway_resource" "user_data" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "user-data"
}

# API Gateway method (GET) for /user-data
resource "aws_api_gateway_method" "get_user_data" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_data.id
  http_method   = "GET"
  authorization = "NONE"  # We'll add Cognito auth later
}

# Integration between API Gateway and Lambda
# This tells API Gateway to invoke the Lambda function
resource "aws_api_gateway_integration" "get_user_data" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_data.id
  http_method = aws_api_gateway_method.get_user_data.http_method
  
  # Integration type: AWS_PROXY means API Gateway passes the entire request to Lambda
  # Lambda returns the HTTP response directly
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_user_data.invoke_arn
}

# Permission for API Gateway to invoke Lambda
# Without this, API Gateway can't call the Lambda function
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user_data.function_name
  principal     = "apigateway.amazonaws.com"
  
  # Allow any API Gateway in this account to invoke
  source_arn = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway deployment
# This actually publishes the API so it's accessible
resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_integration.get_user_data
  ]
  
  rest_api_id = aws_api_gateway_rest_api.main.id
  
  # Triggers a new deployment when any resource changes
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.user_data.id,
      aws_api_gateway_method.get_user_data.id,
      aws_api_gateway_integration.get_user_data.id
    ]))
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway stage
# The stage creates a URL like: https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.environment
}