# main.tf
# Main infrastructure resources

# Configure AWS provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # Use latest 5.x version
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"  # For creating zip files for Lambda deployment packages
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Common tags for all resources
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# S3 bucket for frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${var.environment}"

  tags = local.common_tags
}

# Enable versioning on S3 bucket
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption on S3 bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to S3 bucket
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# DynamoDB table for Users
resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-users"
  billing_mode = "PAY_PER_REQUEST"  # On-demand pricing

  hash_key = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = local.common_tags
}

# DynamoDB table for Habits
resource "aws_dynamodb_table" "habits" {
  name         = "${var.project_name}-habits"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "userId"
  range_key = "habitId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "habitId"
    type = "S"
  }

  tags = local.common_tags
}

# DynamoDB table for Completions
resource "aws_dynamodb_table" "completions" {
  name         = "${var.project_name}-completions"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "userId"
  range_key = "completionDate#habitId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "completionDate#habitId"
    type = "S"
  }

  tags = local.common_tags
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  username_attributes = ["email"]

  auto_verified_attributes = ["email"]

  tags = local.common_tags
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false  # For web apps, we don't need a client secret

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",        # Secure Remote Password - recommended secure method
    "ALLOW_USER_PASSWORD_AUTH",   # Direct password auth (less secure, but sometimes needed)
    "ALLOW_REFRESH_TOKEN_AUTH"    # Token refresh
  ]

  supported_identity_providers = ["COGNITO"]
}