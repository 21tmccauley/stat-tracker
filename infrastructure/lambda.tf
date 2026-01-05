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

# Cognito Authorizer for API Gateway
# This validates JWT tokens from Cognito before allowing requests to reach Lambda
# When a request comes in with an Authorization header containing a Cognito JWT token,
# API Gateway validates it and extracts user information (like userId/sub) from the token
resource "aws_api_gateway_authorizer" "cognito" {
  name                   = "${var.project_name}-cognito-authorizer"
  rest_api_id            = aws_api_gateway_rest_api.main.id
  type                   = "COGNITO_USER_POOLS"
  provider_arns          = [aws_cognito_user_pool.main.arn]
  authorizer_credentials = null  # Not needed for Cognito User Pools authorizer
}

# API Gateway resource for /user-data endpoint
resource "aws_api_gateway_resource" "user_data" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "user-data"
}

# API Gateway method (GET) for /user-data
# Now secured with Cognito authorization - users must be authenticated
resource "aws_api_gateway_method" "get_user_data" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id     = aws_api_gateway_resource.user_data.id
  http_method     = "GET"
  authorization   = "COGNITO_USER_POOLS"  # Require Cognito authentication
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
}

# OPTIONS method for CORS preflight requests
# Browsers send an OPTIONS request before the actual GET request to check CORS permissions
# This is called a "preflight" request - API Gateway must handle it and return CORS headers
resource "aws_api_gateway_method" "options_user_data" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_data.id
  http_method   = "OPTIONS"
  authorization = "NONE"  # Preflight requests don't need authentication
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

# Mock integration for OPTIONS (CORS preflight)
# This doesn't call Lambda - it just returns CORS headers directly from API Gateway
# Mock integrations are perfect for preflight requests since we just need to return headers
resource "aws_api_gateway_integration" "options_user_data" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_data.id
  http_method = aws_api_gateway_method.options_user_data.http_method
  
  # MOCK integration means API Gateway handles it internally without calling backend
  type = "MOCK"
  
  # Request template - we don't need to transform anything for OPTIONS
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Method response for OPTIONS - defines what headers the response will include
# This is where we declare the CORS headers that will be sent back to the browser
resource "aws_api_gateway_method_response" "options_user_data" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_data.id
  http_method = aws_api_gateway_method.options_user_data.http_method
  status_code = "200"
  
  # These are the CORS headers that will be returned
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# Integration response for OPTIONS - maps the actual header values
# This connects the method response (declaration) to actual values
resource "aws_api_gateway_integration_response" "options_user_data" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_data.id
  http_method = aws_api_gateway_method.options_user_data.http_method
  status_code = aws_api_gateway_method_response.options_user_data.status_code
  
  # Map the response headers to actual CORS values
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"  # In production, restrict to your domain
  }
  
  depends_on = [aws_api_gateway_integration.options_user_data]
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
  # Include all resources so deployment happens when anything changes
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.user_data.id,
      aws_api_gateway_method.get_user_data.id,
      aws_api_gateway_method.options_user_data.id,
      aws_api_gateway_integration.get_user_data.id,
      aws_api_gateway_integration.options_user_data.id,
      aws_api_gateway_authorizer.cognito.id
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