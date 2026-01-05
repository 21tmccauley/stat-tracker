# variables.tf
# Variables for project Configuration

variable "project_name" {
  description = "Name of the project, used in resource naming"
  type        = string
  default     = "stat-tracker"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}