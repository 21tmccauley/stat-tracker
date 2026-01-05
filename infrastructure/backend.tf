# Terraform Backend Configuration
# This tells Terraform where to store its state file remotely

# Pseudo-code structure:
# 
# terraform {
#   backend "s3" {
#     # The S3 bucket where state will be stored
#     # Format: stat-tracker-terraform-state-{your-name}
#     bucket = "stat-tracker-terraform-state-..."
#     
#     # The key/path within the bucket for the state file
#     # This is like a filename - can be just "terraform.tfstate"
#     key = "..."
#     
#     # AWS region where the bucket exists
#     region = "..."
#     
#     # DynamoDB table for state locking (prevents concurrent modifications)
#     # Format: stat-tracker-terraform-locks
#     dynamodb_table = "..."
#     
#     # Optional: Enable encryption at rest
#     encrypt = true
#   }
# }

# Notes:
# - This block goes at the top level (not inside a resource)
# - The bucket and dynamodb_table must exist BEFORE you run terraform init
# - Use the bootstrap script to create these resources first
# - After creating, uncomment and fill in the actual values

terraform {
  backend "s3" {
    bucket         = "stat-tracker-terraform-state-tate-mccauley"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "stat-tracker-terraform-locks"
    encrypt        = true
  }
}