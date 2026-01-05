# RPG Habit Tracker

A gamified habit tracking application built with AWS and Terraform. Complete daily habits to earn XP, level up your character, and unlock achievements.

> **Note**: This is a personal learning project focused on understanding AWS serverless architecture, Terraform, and React development.

## Architecture

- **Frontend**: React PWA hosted on S3 + CloudFront
- **Backend**: API Gateway + Lambda (serverless)
- **Database**: DynamoDB
- **Authentication**: AWS Cognito
- **Infrastructure**: Terraform

## Project Structure

```
stat-tracker/
├── infrastructure/     # Terraform IaC
├── frontend/          # React PWA application
├── backend/           # Lambda functions
├── scripts/           # Deployment scripts (Windows & Linux/Mac)
└── docs/              # Additional documentation
```

See [PROJECT_STRUCTURE.md](./Proposed_Structure.md) for detailed file structure.

## Prerequisites

- AWS CLI configured with credentials
- Terraform >= 1.0
- Node.js >= 18
- npm or yarn
- Git (for version control)

## Getting Started

### 1. Backend State Setup (One-time)

Before running Terraform, create the S3 bucket for remote state:

**Windows (PowerShell):**
```powershell
.\scripts\setup-backend-state.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/setup-backend-state.sh
./scripts/setup-backend-state.sh
```

Or manually run the AWS CLI commands (see SETUP.md for details).

### 2. Configure Terraform Variables

Copy the example variables file and fill in your values:

**Windows (PowerShell):**
```powershell
cd infrastructure
Copy-Item terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

**Linux/Mac (Bash):**
```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3. Deploy Infrastructure

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### 4. Configure Frontend Environment Variables

Copy the example environment file and fill in values from Terraform outputs:

**Windows (PowerShell):**
```powershell
cd frontend
Copy-Item .env.example .env.local
# Edit .env.local with values from terraform output
```

**Linux/Mac (Bash):**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with values from terraform output
```

### 5. Deploy Frontend

**Windows (PowerShell):**
```powershell
.\scripts\deploy-frontend.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

Or manually:
```bash
cd frontend
npm install
npm run build
# Upload build/ to S3 bucket (output from Terraform)
aws s3 sync build/ s3://YOUR_BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Development

### Local Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The app will run on `http://localhost:5173` (Vite default).

**Note**: For local development, you may need to:
- Mock Cognito authentication (see `docs/LOCAL_DEV.md`)
- Use a local API endpoint or configure CORS for direct API Gateway calls

### Local Lambda Development

You can test Lambda functions locally using:

**Option 1: Simple Node.js script**
```bash
cd backend/getUserData
node test-local.js  # Create a simple test script
```

**Option 2: AWS SAM CLI** (more advanced)
```bash
sam local invoke getUserData --event event.json
```

**Option 3: Deploy and test**
```bash
# Package and deploy via Terraform
terraform apply -target=aws_lambda_function.get_user_data
# Test via API Gateway or AWS Console
```

See `docs/LOCAL_DEV.md` for detailed local development setup.

### DynamoDB Schema

The database uses three tables:
- **Users**: User profiles, levels, and stats
- **Habits**: User's habit definitions
- **Completions**: Habit completion records

See `docs/DYNAMODB_SCHEMA.md` or `PROJECT_STRUCTURE.md` for detailed schema documentation.

## MVP Features

- ✅ User authentication (Cognito)
- ✅ Create and complete habits
- ✅ Earn XP and level up
- ✅ Character stats dashboard
- ✅ PWA support (installable app)

## Future Enhancements

- Quest system
- AI-generated quests (Claude API)
- Streak tracking
- Individual stat categories
- Charts and analytics

## Learning Resources

This project is designed to help you learn:

- **Terraform**: Infrastructure as Code, remote state, AWS resource management
- **AWS Serverless**: Lambda, API Gateway, DynamoDB, Cognito
- **React**: Component architecture, Context API, PWA development
- **DynamoDB**: NoSQL data modeling, access patterns, query design

## Troubleshooting

Common issues and solutions are documented in `docs/TROUBLESHOOTING.md`.

## Additional Documentation

- `TIMELINE.md` - **Start here!** Project progression and learning phases
- `PROJECT_STRUCTURE.md` - Detailed file structure and explanations
- `SETUP.md` - Step-by-step setup instructions
- `docs/LOCAL_DEV.md` - Local development guide
- `docs/DYNAMODB_SCHEMA.md` - Database schema details

