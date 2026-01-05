# Bootstrap Script for Terraform Backend State
# This script creates the S3 bucket and DynamoDB table needed for Terraform remote state
# Run this ONCE before your first terraform init

param(
    [Parameter(Mandatory=$false)]
    [string]$YourName = "tate-mccauley",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

# Configuration
$BucketName = "stat-tracker-terraform-state-$YourName".ToLower()
$DynamoTableName = "stat-tracker-terraform-locks"
$StateKey = "terraform.tfstate"

Write-Host "Setting up Terraform backend state..." -ForegroundColor Cyan
Write-Host "Bucket: $BucketName" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "DynamoDB Table: $DynamoTableName" -ForegroundColor Yellow
Write-Host ""

# Check if bucket already exists
Write-Host "Checking if S3 bucket exists..." -ForegroundColor Cyan
$bucketExists = aws s3api head-bucket --bucket $BucketName 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Bucket already exists: $BucketName" -ForegroundColor Yellow
} else {
    Write-Host "Creating S3 bucket: $BucketName" -ForegroundColor Cyan
    
    # Create bucket
    # Note: If region is us-east-1, omit --region flag (it's the default)
    if ($Region -eq "us-east-1") {
        aws s3api create-bucket --bucket $BucketName
    } else {
        aws s3api create-bucket --bucket $BucketName --region $Region --create-bucket-configuration LocationConstraint=$Region
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] S3 bucket created successfully" -ForegroundColor Green
        
        # Enable versioning (good practice for state files)
        Write-Host "Enabling versioning on bucket..." -ForegroundColor Cyan
        aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled
        
        # Enable encryption
        Write-Host "Enabling encryption on bucket..." -ForegroundColor Cyan
        $encryptionConfig = '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
        aws s3api put-bucket-encryption --bucket $BucketName --server-side-encryption-configuration $encryptionConfig
        
        Write-Host "[OK] Bucket configured with versioning and encryption" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create S3 bucket" -ForegroundColor Red
        exit 1
    }
}

# Check if DynamoDB table already exists
Write-Host ""
Write-Host "Checking if DynamoDB table exists..." -ForegroundColor Cyan
$tableExists = aws dynamodb describe-table --table-name $DynamoTableName --region $Region 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "DynamoDB table already exists: $DynamoTableName" -ForegroundColor Yellow
} else {
    Write-Host "Creating DynamoDB table: $DynamoTableName" -ForegroundColor Cyan
    
    # Create DynamoDB table for state locking
    # LockID is the partition key (required by Terraform)
    aws dynamodb create-table `
        --table-name $DynamoTableName `
        --attribute-definitions AttributeName=LockID,AttributeType=S `
        --key-schema AttributeName=LockID,KeyType=HASH `
        --billing-mode PAY_PER_REQUEST `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] DynamoDB table created successfully" -ForegroundColor Green
        Write-Host "Waiting for table to be active..." -ForegroundColor Cyan
        aws dynamodb wait table-exists --table-name $DynamoTableName --region $Region
    } else {
        Write-Host "[ERROR] Failed to create DynamoDB table" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update infrastructure/backend.tf with these values:" -ForegroundColor Yellow
Write-Host "   bucket = `"$BucketName`"" -ForegroundColor White
Write-Host "   key = `"$StateKey`"" -ForegroundColor White
Write-Host "   region = `"$Region`"" -ForegroundColor White
Write-Host "   dynamodb_table = `"$DynamoTableName`"" -ForegroundColor White
Write-Host ""
Write-Host "2. Run: cd infrastructure" -ForegroundColor Yellow
Write-Host "3. Run: terraform init" -ForegroundColor Yellow
Write-Host ""

