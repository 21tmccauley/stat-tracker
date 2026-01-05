# Project Structure

```
stat-tracker/
├── infrastructure/              # Terraform Infrastructure as Code
│   ├── backend.tf              # Remote state configuration (S3 + DynamoDB)
│   ├── main.tf                 # Main infrastructure (S3, CloudFront, Cognito, DynamoDB, API Gateway)
│   ├── lambda.tf               # Lambda functions and API Gateway integrations
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values (URLs, IDs, etc.)
│   └── terraform.tfvars.example # Example configuration file
│
├── frontend/                    # React PWA Application
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   ├── sw.js               # Service worker for PWA
│   │   └── icons/              # PWA icons (192x192, 512x512)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── HabitCard.jsx   # Individual habit display
│   │   │   ├── StatsDisplay.jsx # Character stats component
│   │   │   ├── LevelProgress.jsx # XP and level progress bar
│   │   │   └── HabitForm.jsx   # Create/edit habit form
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx   # Main dashboard with stats
│   │   │   ├── Habits.jsx      # Habits list and management
│   │   │   └── Login.jsx       # Authentication page
│   │   ├── contexts/           # React Context providers
│   │   │   └── AuthContext.jsx # Cognito authentication state
│   │   ├── services/           # API and external services
│   │   │   └── api.js          # API client for Lambda endpoints
│   │   ├── utils/              # Utility functions
│   │   │   └── helpers.js      # Helper functions
│   │   ├── App.jsx             # Main app component with routing
│   │   ├── App.css             # App styles
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Frontend dependencies
│   ├── .eslintrc.cjs           # ESLint configuration
│   └── .env.example            # Example environment variables
│
├── backend/                     # Lambda Functions
│   ├── completeHabit/
│   │   ├── index.js            # Complete habit, award XP, check level-up
│   │   └── package.json        # Lambda dependencies
│   ├── getUserData/
│   │   ├── index.js            # Get user stats, habits, completions
│   │   └── package.json        # Lambda dependencies
│   ├── createHabit/
│   │   ├── index.js            # Create new habit
│   │   └── package.json        # Lambda dependencies
│   └── shared/                 # Shared utilities (optional)
│       ├── responses.js        # Standardized API responses
│       └── errors.js           # Error handling utilities
│
├── scripts/                     # Deployment and utility scripts
│   ├── setup-backend-state.sh  # One-time setup for Terraform state (Linux/Mac)
│   ├── setup-backend-state.ps1 # One-time setup for Terraform state (Windows)
│   ├── package-lambdas.sh     # Package Lambda functions (Linux/Mac)
│   ├── package-lambdas.ps1     # Package Lambda functions (Windows)
│   ├── deploy-frontend.sh      # Deploy frontend to S3 + invalidate CloudFront (Linux/Mac)
│   ├── deploy-frontend.ps1     # Deploy frontend to S3 + invalidate CloudFront (Windows)
│   └── deploy-lambda.sh        # Deploy individual Lambda function
│
├── docs/                        # Documentation
│   ├── LOCAL_DEV.md            # Local development guide
│   ├── DYNAMODB_SCHEMA.md      # Database schema documentation
│   └── TROUBLESHOOTING.md      # Common issues and solutions
│
├── .gitignore                   # Git ignore rules
├── README.md                    # Project overview
├── SETUP.md                     # Detailed setup instructions
└── PROJECT_STRUCTURE.md         # This file

```

## Key Files Explained

### Infrastructure Files

- **backend.tf**: Configures Terraform to use S3 for remote state and DynamoDB for state locking
- **main.tf**: Defines core AWS resources (S3 bucket, CloudFront, Cognito, DynamoDB, API Gateway)
- **lambda.tf**: Defines Lambda functions, IAM roles, and API Gateway integrations
- **variables.tf**: Declares input variables (region, environment, project name, etc.)
- **outputs.tf**: Outputs important values like API URLs, Cognito IDs, CloudFront domain

### Frontend Files

- **manifest.json**: PWA configuration (app name, icons, display mode)
- **sw.js**: Service worker for offline support and PWA installation
- **vite.config.js**: Vite bundler configuration (faster than Create React App)
- **components/**: Reusable UI components (HabitCard, StatsDisplay, etc.)
- **pages/**: Main page components (Dashboard, Habits, Login)
- **contexts/**: React Context for global state (authentication)
- **services/api.js**: Centralized API client for Lambda endpoints
- **.env.example**: Template for environment variables

### Backend Files

Each Lambda function follows this pattern:
- **index.js**: Main handler function (exports a handler for API Gateway)
- **package.json**: Node.js dependencies (AWS SDK v3)

Optional shared utilities:
- **shared/responses.js**: Standardized success/error response formatting
- **shared/errors.js**: Common error handling utilities

### Scripts

- **setup-backend-state.sh/.ps1**: One-time setup for Terraform remote state infrastructure
- **package-lambdas.sh/.ps1**: Zips Lambda functions for Terraform deployment
- **deploy-frontend.sh/.ps1**: Builds React app and deploys to S3 + invalidates CloudFront cache
- **deploy-lambda.sh**: Deploy individual Lambda function (for testing)

## Data Flow

```
User Browser
    ↓
CloudFront (CDN)
    ↓
S3 (Static Files)
    ↓
React App
    ↓
API Gateway
    ↓
Lambda Functions
    ↓
DynamoDB
```

## AWS Resources Created

1. **S3 Bucket**: Hosts static frontend files
2. **CloudFront**: CDN for fast global delivery
3. **Cognito User Pool**: User authentication
4. **DynamoDB Table**: Stores user data, habits, completions
5. **API Gateway**: REST API endpoints
6. **Lambda Functions**: Serverless backend logic
7. **IAM Roles**: Permissions for Lambda functions

## Environment Variables

Frontend needs these (set in `.env.local`):
- `VITE_AWS_REGION`
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`
- `VITE_API_GATEWAY_URL`

Lambda functions get these from Terraform:
- `TABLE_NAME`: DynamoDB table name
- `AWS_REGION`: AWS region

## DynamoDB Schema

### Users Table
- **Table Name**: `{project-name}-users`
- **Partition Key**: `userId` (String) - Cognito User ID
- **Attributes**:
  - `level` (Number): Current character level
  - `totalXP` (Number): Total XP earned
  - `stats` (Map): Individual stat categories (e.g., `strength`, `intelligence`)
  - `createdAt` (String): ISO timestamp
  - `lastLogin` (String): ISO timestamp

### Habits Table
- **Table Name**: `{project-name}-habits`
- **Partition Key**: `userId` (String)
- **Sort Key**: `habitId` (String) - UUID
- **Attributes**:
  - `name` (String): Habit name
  - `description` (String): Optional description
  - `xpReward` (Number): XP awarded on completion
  - `createdAt` (String): ISO timestamp
  - `isActive` (Boolean): Whether habit is currently active

### Completions Table
- **Table Name**: `{project-name}-completions`
- **Partition Key**: `userId` (String)
- **Sort Key**: `completionDate#habitId` (String) - Composite key (e.g., "2024-01-15#uuid")
- **Attributes**:
  - `habitId` (String): Reference to habit
  - `completedAt` (String): ISO timestamp
  - `xpEarned` (Number): XP earned for this completion
  - `streak` (Number): Current streak count (optional)

### Access Patterns

1. **Get user profile**: Query Users table by `userId`
2. **Get user's habits**: Query Habits table by `userId`
3. **Get completions for date range**: Query Completions table by `userId`, filter by `completionDate` prefix
4. **Get habit completions**: Query Completions table by `userId`, filter by `habitId` in sort key

### Notes

- All tables use on-demand billing (pay per request) for simplicity
- Consider adding Global Secondary Indexes (GSIs) if query patterns change
- TTL can be added to Completions table to auto-delete old records (optional)

